fis-command-jsdoc
===
`fis-command-jsdoc` is a plugin for Baidu's FIS and supplied a command to generate the JSDoc documents.

## Install

	npm install fis-command-jsdoc -g
    **Unfamiliar with `npm`? Don't have node installed?** That's a-okay. npm stands for [node packaged modules](http://npmjs.org/) and is a way to manage development dependencies through node.js. [Download and install node.js](http://nodejs.org/download/) before proceeding.

## Dependencies

	jsdoc >= 3.2.2
    tmp >= 0.0.24
    spawn-sync >= 1.0.0
    ink-docstrap >= 0.4.12

## Usage

	Usage: jsdoc [options]

	Options:

        -h, --help                 output usage information
        --src <source>             The source file or directories for Generating
        --dest <destination>       The destination of JSDoc. The document will generate to the "docs" directory in your project in default.
        --conf <path>              The configuration of JSDoc. It may be overwrited by the setting in fis-conf.js
        --template <templatePath>  The JSDoc template path
        --verbose                  Debug options

## Example

### In your `fis-conf.js`:

    fis.config.set('settings.jsdoc', {
        //Setting source files
        'src': ["static/js/outer.js","static/module/sendOuter.js"],
        //Include fis-conf.js for declearing the namespace and the packing strategy
        'includeFisConf': true
    });

### In your JSDoc configure file(jsdoc-conf.js):

    {
        "tags": {
            "allowUnknownTags": true
        },  
        "plugins": ["plugins/markdown"],
        "templates": {
            "default":{
                "outputSourceFiles": true
            },  
            "systemName": "Outer module",
            "linenums": true,
            "inverseNav": true,
            "copyright": "Baidu"
        },  
        "lenient": true,
        "markdown": {
            "parser": "gfm",
            "hardwrap": true
        }   
    }

### Execute the command

    `jello jsdoc --conf jsdoc-conf.js` or `fis jsdoc --conf jsdoc-conf.js`

## Release History
0.1.0 Released
