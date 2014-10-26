/**
 * fis-command-jsdoc
 *
 * Generate the JSDoc document for fis
 * @author Jone Casper(xu.chenhui@live.com)
 */
/* global fis*/

var fs = require("fs");
var tmp = require("tmp");
var jsdoc = require("jsdoc");
var path = require("path");

var exec = require("./exec.js");

//Detect the path is an absolute path or not
//Are there any api in nodeJs can replace it?
var isRootPath = function(path){
    return !!(path && path[0] === path.sep);
};

//Default template path
var DEFAULT_TEMPLATE = "./node_modules/ink-docstrap/template";

exports.name = 'jsdoc';
exports.desc = 'Generate the JSDoc document for F.I.S';
exports.register = function(commander){
    commander
    .option('--src', 'The source file or directories for Generating', String)
    .option('--dest', 'The destination of JSDoc. The document will generate to the "docs" directory in your project in default.', String)
    .option('--conf', 'The configuration of JSDoc. It may be overwrited by the setting in fis-conf.js', String)
    .option('--template', 'The JSDoc template path', String)
    .action(function(){
        var docOptions,
            options = arguments[arguments.length - 1],
            rootPath = fis.util.realpath();

        //First, read configure file if exist
        if (options.conf){
            var jsDocPath = isRootPath(options.conf) ? path.join(rootPath, options.conf) : options.conf;
            if (fis.util.isFile(jsDocPath)){
                docOptions = fis.util.readJSON(jsDocPath) || {};
            }
        }
        
        //Second, read configure from fis-conf.js
        docOptions = fis.util.merge(fis.config.get('settings.jsdoc.options'), docOptions);
        
        //Merge to arguments of jsdoc
        //Add the support for @private tag
        var jsDocArgs = {"private" : true};
        //Get the source file from the options
        var source = options.src;
        if (source){
            if (fis.util.isDir(source)){
                //When the source is an directory, open the recurse options
                jsDocArgs.recurse = true;
            }
        }else{
            //TODO:Get the source files and can support filter like grunt
            
        }
        
        //Get the destination from the options or point to the default destination
        jsDocArgs.destination = (
            options.dest && 
            (isRootPath(options.dest) ? path.join(rootPath, options.dest) : options.dest)
        ) || "docs";
        //Check the template.The plugin includes docstrap, as well as the default template provided by jsdoc3.
        jsDocArgs.template = options.template || DEFAULT_TEMPLATE;

        if (options.verbose){
            //Open the debug options:w
            jsDocArgs.debug = true;
            jsDocArgs.verbose = true;
        }
        docOptions.opts = jsDocArgs;

        //Generate the jsdoc conf.json
        tmp.file(function (err, path, fd) {
            if (err) {
                throw err;
            }
            //Write the jsDoc configuration
            fs.writeSync(fd, JSON.stringify(docOptions));
            fs.fsyncSync(fd);

            exec.swapn(source, {
                "configure": path
            }); 
        });
    });
};
