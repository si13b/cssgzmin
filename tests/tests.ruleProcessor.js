/**
 * Created by Simon on 6/05/2016.
 */
const process = require('../src/ruleProcessor').process,
	assert = require('chai').assert;

describe('ruleProcessor tests', () => {
	it('should return null if empty rule', () => {
		assert.notOk(process('body {   } '));
	});

	it('should perform correct parsing for single value property', () => {
		assert.deepEqual(process('body {margin: 0px; padding: 0px; width: 100%;}'), {
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
		}, 'should correctly parse body selector with a handful of simple properties');
	});

	it('should order properties correctly', () => {
		assert.deepEqual(process('body {width: 100%; padding: 0px; margin: 0px; }'), {
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
		}, 'should order properties alphabetically');
	});

	it('should process nested media query correctly', () => {
		assert.deepEqual(process('@media (max-width: 600px) { .sidebar { display: none; } } '), {
			selector: '@media (max-width: 600px)',
			rules: [
				{
					selector: '.sidebar',
					properties: [
						{
							property: 'display',
							parts: ['none']
						}
					]
				}
			]
		});
	});

	it('should process keyframe animation correctly', () => {
		assert.deepEqual(process('@keyframes MyAnimation { 0%   { opacity: 0; }	100% { opacity: 1; } }'), {
			selector: '@keyframes MyAnimation',
			rules: [
				{
					selector: '0%',
					properties: [
						{
							property: 'opacity',
							parts: ['0']
						}
					]
				}, {
					selector: '100%',
					properties: [
						{
							property: 'opacity',
							parts: ['1']
						}
					]
				}
			]
		});
	});
});