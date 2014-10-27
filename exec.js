/**
 * The module for execute command for jsDoc
 */

var util = require("util");
var path = require("path");
var child_process = require('child_process');
var spawnSync = require('child_process').spawnSync || require('spawn-sync');

var DEFAULT_JSDOC_PATH = "node_modules/fis-command-jsdoc/node_modules/jsdoc/jsdoc";
var execModule = {
    /**
     * Return the npm Global installs path
     * You can see [here]{@link https://www.npmjs.org/doc/files/npm-folders.html} for more information
     */
    getNpmGlobalPath: function(callback){
        var isWin = process.platform === 'win32'; 
        var result = spawnSync('npm config get prefix');

        if (result.status !== 0){
            process.stderr.write(result.stderr);
            process.exit(result.status);
        }else{
            return isWin ? result.stdout.toString().trim() : path.join(result.stdout.toString().trim(), "lib");
        }
    },
    /**
     * Execute the jsdoc command
     */
    spawn : function(sources, options){
        var args = [];
            isWin = process.platform === 'win32';

        var script = isWin ? "cmd /c " : "";
        if (spawnSync('jsdoc -v').status === 0){
            script += "jsdoc";
        }else{
            var npmPath = execModule.getNpmGlobalPath();
            script += path.join(npmPath, DEFAULT_JSDOC_PATH);
        }
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
        
        return child_process.spawn(script, args, {
            windowsVerbatimArguments: isWin // documentation PR is pending: https://github.com/joyent/node/pull/4259
        });
    }
};
module.exports = execModule;
