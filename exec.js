/**
 * The module for execute command for jsDoc
 */

var fis = require("fis");
var util = require("util");

module.exports = {
    spawn : function(sources, options){
        var args = [];
            isWin = process.platform === 'win32';

        var script = isWin ? "cmd /c node -e " : "";
        script += "node_modules/jsdoc/jsdoc.js";
        
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
        
        return spawn(script, args, {
            windowsVerbatimArguments: isWin // documentation PR is pending: https://github.com/joyent/node/pull/4259
        });
    }
};
