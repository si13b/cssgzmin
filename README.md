# CSS GZip Minifier [![Build Status](https://travis-ci.org/si13b/cssgzmin.svg?branch=master)](https://travis-ci.org/si13b/cssgzmin)

A port of barryvan's [CssMin](https://github.com/barryvan/CSSMin) Java project to JavaScript/NPM.

From the CSSMin github README:
> # What is it?

> CSSMin takes your CSS file and strips out everything that's not needed -- spaces, extra semicolons, redundant units, and so on. That's great, but there are loads of programs that do that. A shell script could do that! So what makes CSSMin different?

> When you deliver content over the web, best practice is to deliver it gzipped. CSSMin takes your CSS file, and optimises it for gzip compression. This means that there's a smaller payload delivered over the wire, which results in a faster experience for your users. It does this optimisation by ensuring that the properties inside your selectors are ordered consistently (alphabetically) and in lower case. That way, the gzip algorithm can work at its best.
  
> What this means in practice is that your gzipped CSSMin-ed files are significantly smaller than plain gzipped CSS, and noticeably smaller than files that have been compressed by other means (say, YUI).

> # What does it do?

> * Replaces font-weight values like 'bold' with their numeric counterparts;
> * Strips quotes wherever possible;
> * Changes as much of the contents to lowercase as possible;
> * Strips all comments from the source;
> * Removes unnecessary whitespace; and, most importantly,
> * Reorders the properties within your selectors alphabetically.



# Usage as a command line tool

Install:

	npm install -g cssgzmin
	
Usage:

	cssgzmin infile [outfile]
	
Will write to stdout if outfile omitted

# Usage as a module

Install

	npm install --save cssgzmin

Usage:

	const minify = require('cssgzmin').minify;
	
	console.log(minify('.somerule { border: 0px; } .morerules { background: darkblue; }'));

# Requirements

This tool was written for NodeJS 6+, to take advantage of ES6 features. Running the source through Babel would probably allow it run with older versions of Node. If there's high enough demand I'll consider making that a permanent build step.

# Contributors

cssgzmin is as port of CSSMin to JavaScript/NPM, which was originally written, and is maintained by, Barry van Oudtshoorn. See [CssMin](https://github.com/barryvan/CSSMin) for a full list of contributors to the original project.

This JavaScript port was originally written by, and is maintained by, Simon Bracegirdle.


# License

cssgzmin is licensed under the BSD License. See LICENSE for details.