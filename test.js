'use strict';

var tape = require('tape');
var postcss = require('postcss');
var plugin = require('./');
var name = require('./package.json').name;

var tests = [{
    message: 'should enable all modules from css',
    fixture: '/* test comment */@use postcss-discard-comments;/* test comment */',
    expected: '',
    options: {modules: '*'}
}, {
    message: 'should enable postcss-discard-comments from css',
    fixture: '/* test comment */@use postcss-discard-comments;/* test comment */',
    expected: '',
    options: {modules: ['postcss-discard-comments']}
}, {
    message: 'should enable postcss-discard-comments from css, with options',
    fixture: '/*! license comment */@use postcss-discard-comments(removeAll: true);',
    expected: '',
    options: {modules: ['postcss-discard-comments']}
}, {
    message: 'should enable postcss-discard-font-face from css, with array as options',
    fixture: '@use postcss-discard-font-face(["svg", "woff"]); @font-face { font-family: A; src: url("a.svg") format("svg"), url("a.ttf") format("truetype")}',
    expected: '@font-face { font-family: A; src: url("a.svg") format("svg")}',
    options: {modules: ['postcss-discard-font-face']}
}, {
    message: 'should enable autoprefixer from css',
    fixture: '@use autoprefixer (remove: false; browsers: "> 1%, firefox 32");main{-webkit-border-radius:10px;border-radius:10px;display:flex;}',
    expected: 'main{-webkit-border-radius:10px;border-radius:10px;display:-webkit-box;display:-webkit-flex;display:flex;}',
    options: {modules: ['autoprefixer']}
}, {
    message: 'should enable autoprefixer from css, with nested options',
    fixture: '@use autoprefixer { remove: false; browsers: > 0%, firefox 32 };main{-webkit-border-radius:10px;border-radius:10px;display:flex;}',
    expected: 'main{-webkit-border-radius:10px;-moz-border-radius:10px;border-radius:10px;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;}',
    options: {modules: ['autoprefixer']}
}, {
    message: 'should enable autoprefixer from css, with nested stringy options',
    fixture: '@use autoprefixer { remove: false; browsers: "> 0%, firefox 32" };main{-webkit-border-radius:10px;border-radius:10px;display:flex;}',
    expected: 'main{-webkit-border-radius:10px;-moz-border-radius:10px;border-radius:10px;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;}',
    options: {modules: ['autoprefixer']}
}];

function process (css, options) {
    return postcss(plugin(options)).process(css).css;
}

tape(name, function (t) {
    t.plan(tests.length);

    tests.forEach(function (test) {
        var options = test.options || {};
        t.equal(process(test.fixture, options), test.expected, test.message);
    });
});

tape('multiple runs', function (t) {
    t.plan(2);

    var processor = postcss(plugin({modules: ['postcss-discard-comments']}));

    processor.process('@use postcss-discard-comments;/*test*/').then(function (result) {
        t.equal(result.css, '');
    });

    processor.process('/*test*/').then(function (result) {
        t.equal(result.css, '/*test*/');
    });
});

tape('exception handling', function (t) {
    t.plan(7);
    t.throws(function () {
        return process('@use postcss-discard-comments(function () { alert(1); })', {modules: ['postcss-discard-comments']});
    }, 'does not support function syntax');
    t.throws(function () {
        return process('@use postcss-discard-comments(removeAll:)', {modules: ['postcss-discard-comments']});
    }, 'does not support unclosed keys');
    t.throws(function () {
        return process('@use postcss-discard-font-face(["svg")', {modules: ['postcss-discard-font-face']});
    }, 'does not support unclosed arrays');
    t.throws(function () {
        return process('@use postcss-discard-comments;');
    }, 'does not support plugins that are not whitelisted');
    t.throws(function () {
        return process('@use postcss-discard-comments;', {modules: null});
    }, 'does not support null');
    t.throws(function () {
        return process('@use postcss-discard-comments;', {modules: false});
    }, 'does not support false');
    t.throws(function () {
        return process('@use postcss-discard-comments;', {modules: 'all'});
    }, 'does not support strings that are not "*"');
});

tape('should use the postcss plugin api', function (t) {
    t.plan(2);
    t.ok(plugin().postcssVersion, 'should be able to access version');
    t.equal(plugin().postcssPlugin, name, 'should be able to access name');
});
