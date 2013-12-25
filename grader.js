#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');
var HTMLFILE_DEFAULT = "views/index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var LINK_DEFAULT = "http://www.google.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioLink = function(linkdata) {
    return cheerio.load(linkdata);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var printResult = function(result) {
    console.log(JSON.stringify(result, null, 4));
};

var tagFinder = function(checksfile){
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkLink = function(link, checksfile) {
    var res = restler.get(link).on('complete', function(result) {
	if (result instanceof Error) { 
	    console.log('% is not responded', link);
	    process.exit(1);
	};
	$ = cheerioLink(result);
	var out = tagFinder(checksfile);
	printResult(out);
    });
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var out = tagFinder(checksfile);
    printResult(out);
};

var linkProcessor = function(args) {
    args.forEach(function(value, index, array) {
	if (value === '--file' || value === '-f') { 
	    checkJson = checkHtmlFile(program.file, program.checks);
	} else  if (value === '--url' || value === '-u') {
	    checkLink(program.url, program.checks);
	}
    });
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-u, --url <html_link>', 'Link to html file in web')
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.parse(process.argv);
    linkProcessor(process.argv);

} else {
    exports.checkHtmlFile = checkHtmlFile;
    exports.checkLink = checkLink;
}
