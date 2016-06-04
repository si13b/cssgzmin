/**
 * Created by Simon on 6/05/2016.
 */
const parse = require('../src/propertyProcessor').parse,
	handlePrefixes = require('../src/propertyProcessor').handlePrefixes,
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

	describe('handlePrefixes', () => {
		it('should handle prefixes if provided', () => {
			assert.strictEqual(handlePrefixes('*transform'), 'transform~', 'Hack prefix');
			assert.strictEqual(handlePrefixes('-webkit-transform'),
				'transform-webkit-', 'Vendor prefix should become suffix');
			assert.strictEqual(handlePrefixes('transform'), 'transform~', 'No prefix, should add ~ suffix');
			assert.strictEqual(handlePrefixes('border-weight'), 'border~weight~',
				'No prefix, should add ~ suffix and replace - with ~');
			assert.strictEqual(handlePrefixes('-webkit-border-weight'), 'border~weight-webkit-',
				'Prefixed should move to suffix and replace non prefix - with ~');
		});
	});

	describe('comparator', () => {
		it('should order property names correctly', () => {
			assert.strictEqual(comparator('-webkit-border', 'border-weight'), -1,
				'Prefix before property naturally ordered after');
			assert.strictEqual(comparator('border', 'border-weight'), -1, 'Border before border weight');
			assert.strictEqual(comparator('font-size', 'font-weight'), -1, 'Font size before weight');
			assert.strictEqual(comparator('*transform', 'transform'), 0, 'Hack prefix should be equal');
			assert.strictEqual(comparator('-webkit-transform', '-moz-transform'), 1, 'Webkit should appear after moz');
			assert.strictEqual(comparator('-webkit-transform', 'transform'), -1, 'Vendor prefix should be before');
			assert.strictEqual(comparator('padding', 'margin'), 1, 'Margin before padding');
			assert.strictEqual(comparator('z-index', 'width'), 1, 'Z-index after width');
		});
	});
});