/**
 * Module providing functions for processing whole stylesheets.
 */
const ruleProcessor = require('./ruleProcessor');

/**
 * Performs CSS minification of the given stylesheet content.
 * This function is effectively a composition of the #process and #serialise functions.
 * @param {string} content The entire stylesheet content
 * @return {string} The entire minified stylesheet content
 */
const minify = content => serialise(process(content));

/**
 * Process the entire contents of a stylesheet into an optimised object model.
 * @param {string} content The entire stylesheet content
 * @returns {object[]} Collection of rule objects processed.
 */
const process = content => {
	let lastFoundIdx = 0;
	let braceCount = 0;
	let inComment = false;
	let prevCh = null;
	let idx = 0;
	const rules = [];

	for (const ch of content) {
		const nextCh = content[idx + 1];

		if (braceCount < 0) {
			throw Error('Unbalanced braces found');
		} else if (inComment) {
			// Ignore comments
			inComment = !(prevCh === '*' && ch === '/');
		} else if (ch === '/' && nextCh === '*') {
			inComment = true;
		} else if (ch === '{') {
			braceCount += 1;
		} else if (ch === '}') {
			braceCount -= 1;

			// Finished a rule block, lets grab it into a buffer
			if (braceCount === 0) {
				rules.push(ruleProcessor.process(content.substring(lastFoundIdx, idx + 1)));
				lastFoundIdx = idx + 1;
			}
		}

		prevCh = ch;
		idx += 1;
	}

	if (inComment) {
		throw Error('Unterminated comment found');
	}

	if (braceCount > 0) {
		throw Error('Unbalanced braces found');
	}

	return rules;
};

/**
 * Write the given rules objects back into a string.
 * @param {object[]} rules Collection of rule objects to be serialised
 * @returns {string} The serialised CSS content
 */
const serialise = rules => {
	return rules.map(ruleProcessor.serialise).join('');
};

module.exports = {process, serialise, minify};