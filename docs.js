/**
 * fis-command-jsdoc
 *
 * Generate the JSDoc document for fis
 * @author Jone Casper(xu.chenhui@live.com)
 */
/* global fis*/

var fs = require("fs");
var tmp = require("tmp");
var path = require("path");
var util = require("util");

var exec = require("./exec.js");

//Detect the path is an absolute path or not
//Are there any api in nodeJs can replace it?
var isRootPath = function(path){
    return !!(path && path[0] === path.sep);
};

//Default template path
var DEFAULT_TEMPLATE = "node_modules/fis-command-jsdoc/node_modules/ink-docstrap/template";

exports.name = 'jsdoc';
exports.desc = 'Generate the JSDoc document for F.I.S';
exports.register = function(commander){
    commander
    .option('--src <source>', 'The source file or directories for Generating', String)
    .option('--dest <destination>', 'The destination of JSDoc. The document will generate to the "docs" directory in your project in default.', String)
    .option('--conf <path>', 'The configuration of JSDoc. It may be overwrited by the setting in fis-conf.js', String)
    .option('--template <templatePath>', 'The JSDoc template path', String)
    .option('--verbose', 'Debug option')
    .action(function(){
        var docOptions = {},
            options = arguments[arguments.length - 1],
            rootPath = fis.util.realpath(".");
        //Loading the fis-conf.js
        var fisConfPath = path.join(rootPath, "./fis-conf.js");
        if (fis.util.isFile(fisConfPath)){
            require(fisConfPath);
        }else{
            console.error("Can not find fis-conf.js in current directory.");
            process.exit(1);
        }

        //First, read configure file if exist
        if (options.conf){
            var jsDocPath = isRootPath(options.conf) ? path.join(rootPath, options.conf) : options.conf;
            if (fis.util.isFile(jsDocPath)){
                docOptions = fis.util.readJSON(jsDocPath) || {};
            }
        }
        
        //Second, read configure from fis-conf.js
        docOptions = fis.util.merge(fis.config.get('settings.jsdoc.options'), docOptions) || {};

        //Merge to arguments of jsdoc
        //Add the support for @private tag
        var jsDocArgs = {"private" : true};
        //Get the source file from the options
        var sources = options.src;
        if (sources){
            if (fis.util.isDir(sources)){
                //When the source is an directory, open the recurse options
                jsDocArgs.recurse = true;
            }
        }else{
            sources = [];
            //Reading the src configuration from fis-conf.js
            var optSrc = fis.config.get('settings.jsdoc.src');
            var optSrcFilter = fis.config.get('settings.jsdoc.filter');
            if (!util.isArray(optSrc)){
                optSrc = [optSrc];
            }
            //Find all source files and filter them if the filter function existed
            for (var i=optSrc.length-1; i>=0; i--){
                var sreg = optSrc[i];
                if (fis.util.is(sreg, "String") && !isRootPath(sreg)){
                    sreg = path.join(rootPath, sreg);
                }
                var srcs = fis.util.find(rootPath, sreg);
                if (srcs){
                    if (optSrcFilter){
                        srcs = srcs.filter(optSrcFilter);
                    }
                    sources = sources.concat(srcs);
                }
            }
        }
        var includeFisConf = fis.config.get('settings.jsdoc.includeFisConf');
        if (includeFisConf){
            sources.unshift(fisConfPath);
        }
        fis.log.debug("The source of project is [" + sources.join(",") + "]");
        
        //Get the destination from the options or point to the default destination
        jsDocArgs.destination = (
            options.dest && 
            (isRootPath(options.dest) ? path.join(rootPath, options.dest) : options.dest)
        ) || "docs";
        //Check the template.The plugin includes docstrap, as well as the default template provided by jsdoc3.
        if (options.template){
            jsDocArgs.template = options.template;
        }else{
            var npmPath = exec.getNpmGlobalPath();
            jsDocArgs.template = path.join(npmPath, DEFAULT_TEMPLATE);
        }

        /*if (options.verbose){
            //Open the debug options:w
            jsDocArgs.debug = true;
            jsDocArgs.verbose = true;
        }*/
        docOptions.opts = fis.util.merge(jsDocArgs, docOptions.opts || {});

        //Generate the jsdoc conf.json
        tmp.setGracefulCleanup();
        tmp.file(function (err, _path, fd) {
            if (err) {
                throw err;
            }
            
            //Write the jsDoc configuration
            fs.writeSync(fd, JSON.stringify(docOptions));
            fs.fsyncSync(fd);

            var execChild = exec.spawn(sources, {
                "configure": _path,
                "verbose": !!options.verbose,
                "debug": !!options.verbose
            }); 

            //logs
            execChild.stdout.on("data", function (data){
                fis.log.debug("jsDoc output : " + data);
            });
            execChild.stderr.on("data", function(data){
                console.error("An error occurs in jsDoc process:\n" + data);
            });
            execChild.on("exit", function(code){
                if (code === 0){
                    console.log("Documentation generated to " + path.resolve(docOptions.opts.destination));
                }else{
                    console.error("Documentation generated failed. Error code: " + code);
                }
            });
        });
    });
};
