/**
 * Tests for the #sheetProcessor module.
 */
const sheetProcessor = require('../src/sheetProcessor'),
	fs = require('fs'),
	assert = require('chai').assert;

describe('sheetProcessor tests', () => {
	it('should parse test.basic.css', done => {
		fs.readFile('tests/data/test.basic.css', {encoding: 'UTF-8'}, (err, data) => {
			assert.notOk(err, 'There should be no errors getting test file');

			const result = sheetProcessor.process(data);

			assert.deepEqual(result, [
				{
					selector: 'body',
					properties: [
						{
							property: 'margin',
							parts: ['0']
						}, {
							property: 'padding',
							parts: ['0']
						}, {
							property: 'width',
							parts: ['100%']
						}
					]
				}, {
					selector: '.someClass',
					properties: [
						{
							property: 'box-shadow',
							parts: ['2px 4px 0 rgba(255', '0', '0', '0.5)']
						}, {
							property: 'margin',
							parts: ['0']
						}, {
							property: 'padding',
							parts: ['4px']
						}, {
							property: 'width',
							parts: ['auto!important']
						}
					]
				}, {
					selector: '.someClass>.something',
					properties: [
						{
							property: 'border',
							parts: ['1px solid mediumvioletred']
						}
					]
				}
			]);

			done();
		});
	});

	it('should minify test.basic.css', done => {
		fs.readFile('tests/data/test.basic.css', {encoding: 'UTF-8'}, (err, data) => {
			assert.notOk(err, 'There should be no errors getting test file');
			fs.readFile('tests/data/test.basic.expected.css', {encoding: 'UTF-8'}, (err2, expected) => {
				assert.notOk(err2, 'There should be no errors getting test expected file');

				assert.strictEqual(sheetProcessor.minify(data), expected,
					'Serialising test.basic.css should match the expected output in test.basic.expected.css');

				done();
			});
		});
	});

	it('should minify test.advanced.css', done => {
		fs.readFile('tests/data/test.advanced.css', {encoding: 'UTF-8'}, (err, data) => {
			assert.notOk(err, 'There should be no errors getting test file');
			fs.readFile('tests/data/test.advanced.expected.css', {encoding: 'UTF-8'}, (err2, expected) => {
				assert.notOk(err2, 'There should be no errors getting test expected file');

				assert.strictEqual(sheetProcessor.minify(data), expected,
					'Serialising test.advanced.css should match the expected output in test.advanced.expected.css');

				done();
			});
		});
	});
});