/**
 * The module for execute command for jsDoc
 */

var util = require("util");
var path = require("path");
var child_process = require('child_process');
var spawn = child_process.spawn;

var DEFAULT_JSDOC_PATH = "node_modules/fis-command-jsdoc/node_modules/jsdoc/jsdoc";
var isWin = process.platform === 'win32'; 
var execModule = {
    getNpmGlobalPath: function(callback){
        var getPrefix = spawn('npm',['config','get','prefix']);
        getPrefix.stdout.on('data', function(data) {
            var spath = data.toString().trim();
            var npmPath = isWin ? spath : path.join(spath, "lib");
            callback(npmPath);
        });
        getPrefix.stderr.on('data', function(err) {
            console.log("Can not find npm prefix");
            process.stderr.write(err);
        });
        getPrefix.on('close', function(code) {
            if (code !== 0){
                process.exit(code);
            }
        });
    },
    /**
     * Return the npm Global installs path
     * You can see [here]{@link https://www.npmjs.org/doc/files/npm-folders.html} for more information
     */
    getNpmGlobalScript: function(npmPath, callback){
        var script = "jsdoc",
            jsDocVersion = spawn('jsdoc',['-v']);
        jsDocVersion.on('close', function(code){
            if (code === 0){
                //Jsdoc exist
                callback(script);
            }else if (npmPath){
                script = path.join(npmPath, DEFAULT_JSDOC_PATH);
                callback(script);
            }else{
                execModule.getNpmGlobalPath(function(npmPath){
                    if (npmPath){
                        script = path.join(npmPath, DEFAULT_JSDOC_PATH);
                        callback(script);
                    }else{
                        callback(null);
                    }
                });
            }
        });
    },
    /**
     * Execute the jsdoc command
     */
    spawn : function(sources, npmPath, options, callback){
        var args = [];
            isWin = process.platform === 'win32';

        var script = isWin ? "cmd /c " : "";
        /*if (spawnSync('jsdoc -v').status === 0){
            script += "jsdoc";
        }else{
            var npmPath = execModule.getNpmGlobalPath();
            script += path.join(npmPath, DEFAULT_JSDOC_PATH);
        }*/
        execModule.getNpmGlobalScript(npmPath, function(path){
            script += path;
            fis.log.debug("JsDoc command : " + script);
            
            var cmd = "";
            fis.util.map(options, function(key, value) {
                fis.log.debug('Reading options: ' + key);  
                fis.log.debug('>>>' + value);
                args.push("--" + key);
                if (fis.util.is(value, 'String')){
                    args.push(value);
                }
            });

            if (!util.isArray(sources)){
                sources = [sources];
            }
            args.push.apply(args, sources);

            if (isWin){
                // Windows: quote paths that have spaces
                args = args.map(function(item){ 
                    if (item.indexOf(' ')>=0) {
                        return '"' + item + '"';
                    } else {
                        return item;
                    }
                });
            } else {
                // Unix: escape spaces in paths
                args = args.map(function(item){
                    return item.replace(' ', '\\ ');
                });
            }

            fis.log.debug("Running : "+ script + " " + args.join(' '));
            
            var execp = spawn(script, args, {
                windowsVerbatimArguments: isWin // documentation PR is pending: https://github.com/joyent/node/pull/4259
            });
            if (callback) {
                callback(execp);
            }
        });

    }
};
module.exports = execModule;
