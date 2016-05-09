/**
 * Collection of functions for simplifying value parts of CSS properties.
 */

const constants = require('./constants'),
	R = require('ramda');

/**
 * Wrapping function that performs all simplifications.
 * @param {string} property The property name e.g. width
 * @param {string} part Part of a property value e.g. 0px or bold
 * @returns {object} The updated contents (property doesnt change)
 */
const simplify = ({property, part}) => {
	part = part.replace(' !important', '!important');
	part = part.trim();

	part = simplifyZeroes(property, part);
	part = simplifyParameters(property, part);
	part = simplifyFontWeights(property, part);
	part = simplifyQuotesAndCaps(property, part);
	part = simplifyColourNames(property, part);
	part = simplifyHexColours(property, part);

	return part;
};

/**
 * Simplify zeroes. e.g. 0 0 0 can be reduced to 0 and 0px can be reduced to 0.
 * @param {string} property The property name e.g. width
 * @param {string} part The property value e.g. 0px
 * @returns {string} The updated contents
 */
const simplifyZeroes = (property, part) => {
	// Replace 0in, 0cm, etc. with just 0
	part = part.replace(/(^|\s)(0)+(px|em|%|in|cm|mm|pc|pt|ex)/g, '$1$2');

	// Simplify multiple zeroes
	if ((part === '0 0 0 0') || (part === '0 0 0') || (part === '0 0')) {
		part = '0';
	}

	return part;
};

/**
 * Reduce multiple parameters if they match their corresponding opposites (e.g. 2px 2px).
 * @param {string} property The property name e.g. width
 * @param {string} part The property value e.g. 0px
 * @returns {string} The updated contents
 */
const simplifyParameters = (property, part) => {
	if (property === 'background-size') return part;

	let params = part.split(' ');

	if (params.length === 4 && params[1].toUpperCase() === params[3].toUpperCase()) {
		// We can drop off the fourth item if the second and fourth items match
		// ie turn 3px 0 3px 0 into 3px 0 3px
		params = [params[0], params[1], params[2]];
	}

	if (params.length === 3 && params[0].toUpperCase() === params[2].toUpperCase()) {
		// We can drop off the third item if the first and third items match
		// ie turn 3px 0 3px into 3px 0
		params = [params[0], params[1]];
	}

	if (params.length === 2 && params[0].toUpperCase() === params[1].toUpperCase()) {
		// We can drop off the second item if the first and second items match
		// ie turn 3px 3px into 3px
		params = [params[0]];
	}

	return params.join(' ');
};

/**
 * Convert font names (e.g. bold) to font values (e.g. 400), which saves a small amount of space.
 * @param {string} property The property name e.g. width
 * @param {string} part The property value e.g. 0px
 * @returns {string} The updated contents
 */
const simplifyFontWeights = (property, part) => {
	if (property !== 'font-weight') return part;

	part = constants.fontWeights[part.toLowerCase()] || part;

	return part;
};

/**
 * Strip quotes from URLs and vars.
 * @param {string} property The property name e.g. width
 * @param {string} part The property value e.g. 0px
 * @returns {string} The updated contents
 */
const simplifyQuotesAndCaps = (property, part) => {
	if (part.startsWith('url(')) {
		part = part.replace(/url\(('|")?(.*?)\1?\)/g, 'url($2)'); // Strip quotes
	} else if (part.startsWith('var(')) {
		part = part.replace(/\s/g, '');
	} else {
		const words = part.split(/\s/g);

		if (words.length === 1) {
			if (property.toLowerCase() !== 'animation-name') {
				part = part.toLowerCase(); // Make everything lower case (except animation name)
			}
			part = part.replace(/('|")?(.*?)\1/g, '$2'); // Strip quotes
		}
	}

	return part;
};

/**
 * Find a matching HTML colour code from a name, or vice versa. Return the shortest possibility of all of the above.
 * @param {string} property The property name e.g. width
 * @param {string} part The property value e.g. 0px
 * @returns {string} The updated contents
 */
const simplifyColourNames = (property, part) => {
	const colourCode = constants.htmlColours[part.toLowerCase()] || part,
		colourName = constants.htmlColoursInverted[part.toLowerCase()] || part;

	return colourCode.length < colourName.length ? colourCode : colourName;
};

/**
 * Hex colours where each pair is equal (e.g. #AA00FF) can be reduced (e.g. #A0F).
 * @param {string} property The property name e.g. width
 * @param {string} part The property value e.g. 0px
 * @returns {string} The updated contents
 */
const simplifyHexColours = (property, part) => {
	const regex = (/#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/g);
	const result = regex.exec(part);
	if (result) {
		const pairs = [[result[1], result[2]], [result[3], result[4]], [result[5], result[6]]];

		if (R.all(pair => pair[0].toLowerCase() === pair[1].toLowerCase(), pairs)) {
			part = '#' + pairs.map(pair => pair[0]).join('');
		}
	}

	return part;
};

module.exports = {simplify};