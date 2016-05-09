/**
 * Module that supplies tools for parsing of properties into objects that can be simplified.
 */

const valueProcessor = require('./valueProcessor');

const process = line => simplify(parse(line));

const parse = line => {
	let idx = 0;
	let inQuotes = false;
	let separatorIdx = 0;
	const parts = [];

	// Split by the first colon that isn't part of a quoted string.
	for (const ch of line) {
		if (inQuotes) {
			inQuotes = ch !== '"';
		} else if (ch === '"') {
			inQuotes = true;
		} else if (ch === ':' && parts.length === 0) {
			const foundPart = line.substring(separatorIdx, idx);
			if (!foundPart) {
				throw Error(`Found an empty part (${foundPart}) in line (${line})`);
			}
			parts.push(foundPart);
			separatorIdx = idx + 1;
		}

		idx += 1;
	}

	// The rest is considered to be the value(s).
	const foundPart = line.substring(separatorIdx, idx);
	if (!foundPart) {
		throw Error(`Found an empty part (${foundPart}) in line (${line})`);
	}
	parts.push(foundPart);

	if (parts.length !== 2) {
		throw Error(`Found ${parts.length} parts, expected exactly 2 for line (${line})`);
	}

	const property = sanitiseName(parts[0]);

	return {
		property,
		parts: parts[1].trim().replace(/,\s+/g, ',').split(',')
	};
};

/**
 * Simplify a property and its parts that were parsed previously.
 * @param {string} property The CSS property name
 * @param {string[]} parts Parsed property value parts to be simplfied.
 * @returns {{property: *, parts: string[]}} Simplified CSS property and its value parts
 */
const simplify = ({property, parts}) => {
	return {
		property,
		parts: parts.map(part => valueProcessor.simplify({property, part}))
	};
};

/**
 * Serialise a processed property back to a string that can be written out to a CSS file.
 * @param {string} property The CSS property name
 * @param {string[]} parts Simplified property value parts.
 * @returns {string} The simplified CSS property name and values serialised to string.
 */
const serialise = ({property, parts}) => {
	return `${property}:${parts.join(',')}`;
};

/**
 * Sanitise a property name, which includes trimming and converting to lower case (unless prefixed with --).
 * @param {string} name The un-sanitised property name
 * @returns {string} Updated name
 */
const sanitiseName = name => {
	name = name.trim();

	if (!name.startsWith('--')) {
		name = name.toLowerCase();
	}

	return name;
};

/**
 * Comparator for comparing property names with R.sort.
 * @param {string} a The first property name
 * @param {string} b The second property name
 * @returns {number} Negative if a is before b. Positive if a is after b. Zero if equal.
 */
const comparator = (a, b) => stripPrefixes(a).localeCompare(stripPrefixes(b));

/**
 * Strip any hack prefixes e.g. * or vendor prefixes (e.g. -webkit-) from a property name.
 * Vendor prefixes will be replaced as suffixes, for the purposes of sorting.
 * @param {string} name The property name
 * @returns {string} Tidied property name
 */
const stripPrefixes = (name) => {
	if (!name) return name;

	if (name.charAt(0) === '-') { // If vendor prefix, replace as suffix
		name = name.substring(1);
		name = name.substring(name.indexOf('-') + 1);
	} else if (name.charCodeAt(0) < 65) { // If not alphanum, strip it
		name = name.substring(1);
	}

	return name;
};

module.exports = {process, parse, simplify, serialise, stripPrefixes, comparator};