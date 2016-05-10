/**
 * Created by Simon on 6/05/2016.
 */
const simplify = require('../src/valueProcessor').simplify,
	assert = require('chai').assert;

describe('valueProcessor tests', () => {
	it('should reduce !important spacing', () => {
		assert.strictEqual(simplify({property: 'width', part: ' 12px !important '}),
			'12px!important', 'should reduce important spacing');
	});

	it('should simplify zeroes', () => {
		assert.strictEqual(simplify({property: 'width', part: ' 0px'}),
			'0', 'should strip unit if zero');
		assert.strictEqual(simplify({property: 'width', part: ' 000px'}),
			'0', 'should strip unit if multiple zeroes');
		assert.strictEqual(simplify({property: 'padding', part: ' 0px 0px 0px 0px'}),
			'0', 'should strip multiples');
		assert.strictEqual(simplify({property: 'width', part: '0em'}),
			'0', 'should strip unit if zero');
		assert.strictEqual(simplify({property: 'width', part: '  0% '}),
			'0', 'should strip unit if zero');
		assert.strictEqual(simplify({property: 'margin', part: ' 0 0 0 0 '}),
			'0', 'should strip extra zeroes if multiple given');
	});

	it('should not simplify non-zero values', () => {
		assert.strictEqual(simplify({property: 'width', part: ' 10px'}),
			'10px', 'should not strip zero if 10');
		assert.strictEqual(simplify({property: 'padding', part: ' 100px 100px 100px 100px'}),
			'100px', 'should not strip multiple non-zeroes');
		assert.strictEqual(simplify({property: 'width', part: '01em'}),
			'01em', 'should strip unit if leading zero');
		assert.strictEqual(simplify({property: 'width', part: '  1000% '}),
			'1000%', 'should not strip unit if many trailing zeroes');
		assert.strictEqual(simplify({property: 'margin', part: ' 0 10 0 10 '}),
			'0 10', 'should not strip extra zeroes if interleaved with non-zero');
	});

	it('should reduce matching parameters', () => {
		assert.strictEqual(simplify({property: 'border-width', part: '4px 4px 4px 4px'}),
			'4px', 'should reduce to one if all matching');
		assert.strictEqual(simplify({property: 'border-width', part: '4px 2px 4px 2px'}),
			'4px 2px', 'should reduce to two if pairs matching');
		assert.strictEqual(simplify({property: 'border-width', part: '4px 2px 8px 2px'}),
			'4px 2px 8px', 'should reduce to three if pairs matching');
		assert.strictEqual(simplify({property: 'border-width', part: '4px 2px 4px 4px'}),
			'4px 2px 4px 4px', 'should not reduce if pairs matching, but cant reduce');
		assert.strictEqual(simplify({property: 'border-width', part: '4px 2px 8px 16px'}),
			'4px 2px 8px 16px', 'should not reduce if all different');
	});

	it('should replace font names with values', () => {
		assert.strictEqual(simplify({property: 'font-weight', part: 'bold'}),
			'700', 'should replace bold');
		assert.strictEqual(simplify({property: 'font-weight', part: 'normal'}),
			'400', 'should replace normal');
		assert.strictEqual(simplify({property: 'font-something', part: 'normal'}),
			'normal', 'should not replace normal if not font-weight');
	});

	it('should strip quotes and tidy capitalisation', () => {
		assert.strictEqual(simplify({property: 'background', part: 'url(http://www.image.com/mobile-sprite.png)'}),
			'url(http://www.image.com/mobile-sprite.png)', 'should not touch URL that\'s already tidy');
		assert.strictEqual(simplify({property: 'background', part: 'url(\'http://www.image.com/mobile-sprite.png\')'}),
			'url(http://www.image.com/mobile-sprite.png)', 'should remove single quotes from url');
		assert.strictEqual(simplify({property: 'background', part: 'url("http://www.image.com/mobile-sprite.png")'}),
			'url(http://www.image.com/mobile-sprite.png)', 'should remove double quotes from url');
		assert.strictEqual(simplify({
			property: 'background',
			part: 'url(data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\'' +
				'version=\'1.1\'><defs><filter id=\'blur\'><feGaussianBlur stdDeviation=\'8\'/></filter></defs></svg>#blur)'
		}),
		'url(data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\''+
		'version=\'1.1\'><defs><filter id=\'blur\'><feGaussianBlur stdDeviation=\'8\'/></filter></defs></svg>#blur)',
		'should leave unquoted data uri untouched');

		assert.strictEqual(simplify({property: 'background', part: 'var(--MYcolor2)'}),
			'var(--MYcolor2)', 'variable case animation name should be untouched');
		assert.strictEqual(simplify({property: 'background', part: 'var(          --MYcolor2)'}),
			'var(--MYcolor2)', 'variable case animation name should be untouched');

		assert.strictEqual(simplify({property: 'content', part: '\'I do the things\''}),
			'\'I do the things\'', 'content quotes should not be touched');
		assert.strictEqual(simplify({property: 'content', part: '\'things\''}),
			'\'things\'', 'content quotes should not be touched');
	});

	it('should replace colour names/code with shortest possiblity', () => {
		assert.strictEqual(simplify({property: 'color', part: 'red'}),
			'red', 'red is shorter than #f00');
		assert.strictEqual(simplify({property: 'color', part: '#f00'}),
			'red', 'red is shorter than #f00');

		assert.strictEqual(simplify({property: 'color', part: 'yellowgreen'}),
			'#9acd32', '#9acd32 is shorter than yellowgreen');
		assert.strictEqual(simplify({property: 'color', part: '#9acd32'}),
			'#9acd32', '#9acd32 is shorter than yellowgreen');

		assert.strictEqual(simplify({property: 'color', part: '#f8f8f8'}),
			'#f8f8f8', 'Colour code without name left untouched #f8f8f8');
	});

	it('should reduce hex colour codes if possible', () => {
		assert.strictEqual(simplify({property: 'color', part: '#ff00ff'}),
			'#f0f', 'ff00ff can be reduced');
		assert.strictEqual(simplify({property: 'color', part: '#Ff00fF'}),
			'#f0f', 'Ff00fF can be reduced');
		assert.strictEqual(simplify({property: 'color', part: '#fa00ff'}),
			'#fa00ff', 'fa00ff cannot be reduced');
		assert.strictEqual(simplify({property: 'color', part: '#f0f'}),
			'#f0f', 'f0f already reduced');
	});

	it('should not strip surrounding values when reducing hex colour codes', () => {
		assert.strictEqual(simplify({property: 'color', part: '1px solid #ff00ff'}),
			'1px solid #f0f', 'ff00ff can be reduced, shouldn\'t remove border props');
		assert.strictEqual(simplify({property: 'color', part: 'dotted #442277 2px'}),
			'dotted #427 2px', '442277 can be reduced, shouldn\'t remove border props');
	});
});