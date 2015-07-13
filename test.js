var test = require('tape');
var postcss = require('postcss');
var plugin = require('./');
var name = require('./package.json').name;

var tests = [{
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
    message: 'should enable cssnext from css',
    fixture: '@use cssnext(browsers: "firefox < 30"); div { filter: blur(4px) }',
    expected: 'div { filter: url(\'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg"><filter id="filter"><feGaussianBlur stdDeviation="4" /></filter></svg>#filter\'); filter: blur(4px) }',
    options: {modules: ['cssnext']}
}, {
    message: 'should enable autoprefixer from css',
    fixture: '@use autoprefixer (remove: false; browsers: "> 1%, firefox 32");main{-webkit-border-radius:10px;border-radius:10px;display:flex;}',
    expected: 'main{-webkit-border-radius:10px;border-radius:10px;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;}',
    options: {modules: ['autoprefixer']}
}];

function process (css, options) {
    return postcss(plugin(options)).process(css).css;
}

test(name, function (t) {
    t.plan(tests.length);

    tests.forEach(function (test) {
        var options = test.options || {};
        t.equal(process(test.fixture, options), test.expected, test.message);
    });
});

test('exception handling', function (t) {
    t.plan(4);
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
});

test('should use the postcss plugin api', function (t) {
    t.plan(2);
    t.ok(plugin().postcssVersion, 'should be able to access version');
    t.equal(plugin().postcssPlugin, name, 'should be able to access name');
});
