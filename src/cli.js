#! /usr/bin/env node

/**
 * Command line tool for cssgzmin.
 *
 * Usage: cssgzmin infile [outfile]
 *
 * Will write to stdout if outfile omitted
 */

const [, , infile, outfile] = process.argv,
	fs = require('fs'),
	sheetProcessor = require('./sheetProcessor'),
	USAGE = 'Usage: cssgzmin infile [outfile]\n\n\tWill write to stdout if outfile omitted';

if (infile === '--help' || infile === '-h') {
	console.log(USAGE);
} else if (!infile) {
	console.error(`Infile (${infile}) or outfile (${outfile}) was empty.\n${USAGE}`);
} else {
	fs.readFile(infile, {encoding: 'UTF-8'}, (err, content) => {
		if (err) throw err;

		const result = sheetProcessor.minify(content);

		if (outfile) {
			fs.writeFile(outfile, result, {encoding: 'UTF-8'}, err => {
				if (err) throw err;

				console.log('Success');
			});
		} else {
			console.log(result);
		}
	});
}
