/**
 * Created by Simon on 6/05/2016.
 */
const parse = require('../src/propertyProcessor').parse,
	stripPrefixes = require('../src/propertyProcessor').stripPrefixes,
	comparator = require('../src/propertyProcessor').comparator,
	assert = require('chai').assert;

describe('propertyProcessor tests', () => {
	it('should perform correct parsing for single value property', () => {
		assert.deepEqual(parse('font-size: 12px'), {property: 'font-size', parts: ['12px']}, 'font size with single value');
		assert.deepEqual(parse('background-image: url(\'www.randomsitethatdoesntexist.com/someimage.png\')'), {
			property: 'background-image',
			parts: ['url(\'www.randomsitethatdoesntexist.com/someimage.png\')']
		}, 'background image with single URL value');

		assert.deepEqual(parse('background-color: rgba(0,0,0,0.5)'), {
			property: 'background-color',
			parts: ['rgba(0','0','0','0.5)']
		}, 'background color with single  rgb value');

		assert.deepEqual(parse('transform: rotate(15deg) translate(-20px,0px)'), {
			property: 'transform',
			parts: ['rotate(15deg) translate(-20px', '0px)']
		},
		'transform with multiple functions (should be treated as single value)');
	});

	it('should convert to hexcode for rgb() values'); // TODO need to implement, although really belongs in partSimplifier

	it('should perform correct parsing for multi value property', () => {
		assert.deepEqual(parse('box-shadow: inset 0 2px 0px #dcffa6, 0 2px 5px #000'), {
			property: 'box-shadow',
			parts: ['inset 0 2px 0px #dcffa6', '0 2px 5px #000']},
			'box shadow with multiple values');
	});

	describe('stripPrefixes', () => {
		it('should strip prefixes if provided', () => {
			assert.strictEqual(stripPrefixes('*transform'), 'transform', 'Hack prefix');
			assert.strictEqual(stripPrefixes('-webkit-transform'), 'transform', 'Vendor prefix');
			assert.strictEqual(stripPrefixes('transform'), 'transform', 'No prefix');
		});
	});

	describe('comparator', () => {
		it('should order property names correctly', () => {
			assert.strictEqual(comparator('font-size', 'font-weight'), -1, 'Font size before weight');
			assert.strictEqual(comparator('*transform', 'transform'), 0, 'Hack prefix should be equal');
			assert.strictEqual(comparator('-webkit-transform', 'transform'), 0, 'Vendor prefix should be equal');
			assert.strictEqual(comparator('padding', 'margin'), 1, 'Margin before padding');
			assert.strictEqual(comparator('z-index', 'width'), 1, 'Z-index after width');
		});
	});
});