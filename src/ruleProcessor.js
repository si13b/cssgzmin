/**
 * Module for processing individual CSS rules.
 */

const R = require('ramda');
const propertyProcessor = require('./propertyProcessor');

/**
 * Parse the given CSS rule (selector + body) and simplify it for later serialisation.
 * @param {string} rule The CSS selector and body.
 * @returns {{selector: string, rules: object[], properties: object[]}} Returns the processed selector and list of
 * properties
 */
const process = rule => {
	const parts = rule.split('{');

	if (parts.length < 2) {
		throw Error(`Rule has less than two parts (${rule})`);
	}

	const selector = parts[0].trim().replace(/\s*(\+|~|,|=|~=|\^=|\$=|\*=|\|=|>)\s*/g, '$1');

	if (parts.length > 2) {
		return processNested(selector, rule.substring(rule.indexOf('{') + 1).trim());
	} else {
		return processSimple(selector, parts[1]);
	}
};

/**
 * Write the minified version of the given CSS rule to a string
 * @param {string} selector The CSS selector for the rule
 * @param {object[]} [rules] Optionally, nested CSS rules
 * @param {object[]} [properties] If not containing nested CSS rules, the CSS properties in the rule
 * @returns {string} The minified string representation of this CSS rule
 */
const serialise = ({selector, rules, properties}) => {
	if (rules) {
		return `${selector}{${rules.map(serialise).join('')}}`;
	} else if (properties) {
		return `${selector}{${properties.map(propertyProcessor.serialise).join(';')}}`;
	} else {
		throw Error(`Expected either rules or properties to be provided for selector (${selector})`);
	}
};

/**
 * Parse a simple CSS rule (selector + body).
 * @param {string} selector The CSS selector for the rule
 * @param {string} contents The unprocessed body of the CSS rule
 * @returns {{selector: string, properties: object[]}} Returns the processed selector and list of properties
 */
const processSimple = (selector, contents) => {
	contents = contents.trim();

	if (!contents.endsWith('}')) {
		throw Error(`Rule body is missing closing brace (${contents})`);
	}

	if (contents.length === 0) {
		throw Error(`Rule body is empty (${contents})`);
	}

	contents = contents.substring(0, contents.length - 1); // Strip closing brace

	return contents.length ? {
		selector,
		properties: processProperties(contents)
	} : null;
};

/**
 * Parse a complex CSS rule (rules nested inside a media or keyframe block).
 * @param {string} selector The CSS selector for the rule
 * @param {string} contents The unprocessed body of the CSS rule
 * @returns {{selector: string, properties: object[]}} Returns the processed selector and list of properties
 */
const processNested = (selector, contents) => {
	let lastFoundIdx = 0;
	let braceCount = 0;
	let idx = 0;
	const rules = [];

	contents = contents.trim();

	if (!contents.endsWith('}')) {
		throw Error(`Rule body is missing closing brace (${contents})`);
	}

	contents = contents.substring(0, contents.length - 1);

	for (const ch of contents) {
		if (braceCount < 0) {
			throw Error(`Unbalanced braces found at '${ch}' of '${contents}'`);
		} else if (ch === '{') {
			braceCount += 1;
		} else if (ch === '}') {
			braceCount -= 1;

			// Finished a rule block, lets grab it into a buffer
			if (braceCount === 0) {
				rules.push(contents.substring(lastFoundIdx, idx + 1));
				lastFoundIdx = idx + 1;
			}
		}

		idx += 1;
	}

	return {
		selector,
		rules: rules.map(process).filter(rule => !!rule)
	};
};

/**
 * Break up a CSS rule body into individual property/value pairs.
 * @param {string} contents The unprocessed CSS rule body.
 * @returns {Array} A list of simplified and sorted properties
 */
const processProperties = (contents) => {
	const parts = [];
	let insideString = false;
	let insideURL = false;
	let lastIdxStart = 0;
	let idx = 0;
	let previousCh = '';

	for (const ch of contents) {
		if (insideString) {
			insideString = (ch !== '"'); // TODO what about single-char quotes?
		} else if (insideURL) {
			insideURL = (ch !== ')');
		} else if (ch === '"') {
			insideString = true;
		} else if (ch === '(' && previousCh.endsWith('url')) {
			insideURL = true;
		} else if (ch === ';') {
			const substr = contents.substring(lastIdxStart, idx);
			if (substr && substr.trim().length > 0) {
				parts.push(substr);
			}
			lastIdxStart = idx + 1;
		}

		previousCh += ch;
		idx += 1;
	}

	const substr = contents.substring(lastIdxStart, idx);
	if (substr && substr.trim().length > 0) {
		parts.push(substr);
	}

	return R.sort((a, b) => propertyProcessor.comparator(a.property, b.property), parts.map(propertyProcessor.process));
};

module.exports = {process, serialise};
