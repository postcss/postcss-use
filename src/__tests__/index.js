import fs from 'fs';
import path from 'path';
import test from 'ava';
import postcss from 'postcss';
import plugin from '..';
import {name} from '../../package.json';

const tests = [{
    message: 'should enable all modules from css',
    fixture: '/* test comment */@use postcss-discard-comments;/* test comment */',
    expected: '',
    options: {modules: '*'},
}, {
    message: 'should enable postcss-discard-comments from css',
    fixture: '/* test comment */@use postcss-discard-comments;/* test comment */',
    expected: '',
    options: {modules: ['postcss-discard-comments']},
}, {
    message: 'should enable postcss-discard-comments from css, with options',
    fixture: '/*! license comment */@use postcss-discard-comments(removeAll: true);',
    expected: '',
    options: {modules: ['postcss-discard-comments']},
}, {
    message: 'should enable postcss-discard-font-face from css, with array as options',
    fixture: '@use postcss-discard-font-face(["svg", "woff"]); @font-face { font-family: A; src: url("a.svg") format("svg"), url("a.ttf") format("truetype")}',
    expected: '@font-face { font-family: A; src: url("a.svg") format("svg")}',
    options: {modules: ['postcss-discard-font-face']},
}, {
    message: 'should enable autoprefixer from css',
    fixture: '@use autoprefixer(remove: false, browsers: "> 1%, firefox 32");main{-webkit-border-radius:10px;border-radius:10px;display:flex;}',
    expected: 'main{-webkit-border-radius:10px;border-radius:10px;display:flex;}',
    options: {modules: ['autoprefixer']},
}, {
    message: 'should enable autoprefixer from css, with nested stringy options',
    fixture: '@use autoprefixer { remove: false; browsers: "> 0%, firefox 32" };main{-webkit-border-radius:10px;border-radius:10px;display:flex;}',
    expected: 'main{-webkit-border-radius:10px;-moz-border-radius:10px;border-radius:10px;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;}',
    options: {modules: ['autoprefixer']},
}, {
    message: 'should enable autoprefixer from css, with deeply nested options',
    fixture: '@use autoprefixer { remove: false; browsers: "> 0%, firefox 32"; foo: { bar: true } /* ignores comments */ };main{-webkit-border-radius:10px;border-radius:10px;display:flex;}',
    expected: 'main{-webkit-border-radius:10px;-moz-border-radius:10px;border-radius:10px;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;}',
    options: {modules: ['autoprefixer']},
}, {
    message: 'should enable postcss-nesting',
    fixture: '@use postcss-nesting;h1{&{color: red}}',
    expected: 'h1{\n    color: red\n}',
    options: {modules: ['postcss-nesting']},
}];

function process (css, options) {
    return postcss(plugin(options)).process(css).css;
}

tests.forEach(({message, fixture, expected, options}) => {
    test(message, t => {
        t.deepEqual(process(fixture, options), expected);
    });
});

test('multiple runs', t => {
    const processor = postcss(plugin({modules: ['postcss-discard-comments']}));

    return processor.process('@use postcss-discard-comments;/*test*/', {
        from: `${__dirname}/index.css`,
    }).then(({css}) => {
        t.deepEqual(css, '');
    }).then(processor.process('/*test*/', {
        from: `${__dirname}/index.css`,
    }).then(({css}) => {
        t.deepEqual(css, '/*test*/');
    }));
});

function shouldThrow (t, css, opts = {}) {
    t.throws(() => process(css, opts, { from: __dirname }));
}

test('should not support arrows', shouldThrow, '@use postcss-discard-comments(foo => bar)', {modules: ['postcss-discard-comments']});
test('should not support function syntax', shouldThrow, '@use postcss-discard-comments(function () { alert(1); })', {modules: ['postcss-discard-comments']});
test('should not support unclosed keys', shouldThrow, '@use postcss-discard-comments(removeAll:)', {modules: ['postcss-discard-comments']});
test('should not support unclosed arrays', shouldThrow, '@use postcss-discard-font-face(["svg")', {modules: ['postcss-discard-font-face']});
test('should not support plugins that are not whitelisted', shouldThrow, '@use postcss-discard-comments;');
test('should not support null', shouldThrow, '@use postcss-discard-comments;', {modules: null});
test('should not support false', shouldThrow, '@use postcss-discard-comments;', {modules: false});
test('should not support strings that are not "*"', shouldThrow, '@use postcss-discard-comments;', {modules: 'all'});

test('should ignore unknown options', t => {
    return postcss(
        plugin({modules: ['postcss-discard-comments']})
    ).process('@use postcss-discard-comments(removeAll:something)', {
        from: `${__dirname}/index.css`,
    }).then(({css}) => {
        t.deepEqual(css, '');
    });
});

test('should ignore unknown options', t => {
    return postcss(
        plugin({modules: ['postcss-discard-comments']})
    ).process('@use postcss-discard-comments{removeAll:something}', {
        from: `${__dirname}/index.css`,
    }).then(({css}) => {
        t.deepEqual(css, '');
    });
});

test('should use the postcss plugin api', t => {
    t.truthy(plugin().postcssVersion, 'should be able to access version');
    t.deepEqual(plugin().postcssPlugin, name, 'should be able to access name');
});

test('should use plugins relative to CSS file when using resolveFromFile', t => {
    const inputFile = path.join(__dirname, 'fixtures', 'test.css');
    const outputFile = path.join(__dirname, 'fixtures', 'test.out.css');
    const inputCss = fs.readFileSync(inputFile);
    return postcss(plugin({modules: '*', resolveFromFile: true})).process(inputCss, {
        from: inputFile,
        to: outputFile,
    }).then(({css}) => {
        t.deepEqual(css, '.foo {color: red;}\n', 'should remove background decls');
    });
});

test('should give meaningful error when module is not found', t => {
    const inputFile = path.join(__dirname, 'fixtures', 'error.css');
    const outputFile = path.join(__dirname, 'fixtures', 'error.out.css');
    const inputCss = fs.readFileSync(inputFile);
    return postcss(plugin({modules: '*', resolveFromFile: true})).process(inputCss, {
        from: inputFile,
        to: outputFile,
    }).catch(err => {
        t.deepEqual(err.message, `Cannot find module 'postcss-fourohfour'`);
    });
});

test('should not resolve plugins relative to CSS file by default', t => {
    const inputFile = path.join(__dirname, 'fixtures', 'test.css');
    const outputFile = path.join(__dirname, 'fixtures', 'test.out.css');
    const inputCss = fs.readFileSync(inputFile);
    return postcss(plugin({modules: '*'})).process(inputCss, {
        from: inputFile,
        to: outputFile,
    }).catch(err => {
        t.deepEqual(err.message, `Cannot find module 'postcss-nobg'`);
    });
});

test('should be able to specify default options for plugins', t => {
    const inputFile = path.join(__dirname, 'fixtures', 'test.css');
    const outputFile = path.join(__dirname, 'fixtures', 'test.out.css');
    const inputCss = fs.readFileSync(inputFile);
    const options = {
        'postcss-nobg': {onlyImages: true},
    };
    return postcss(plugin({modules: '*', resolveFromFile: true, options})).process(inputCss, {
        from: inputFile,
        to: outputFile,
    }).then(({css}) => {
        const normalized = css.replace(/\s+/g, ' ').trim();
        t.deepEqual(normalized, '.foo {background: blue;color: red;}', 'should remove only background image decls');
    });
});

test('should be able to override default options', t => {
    const inputFile = path.join(__dirname, 'fixtures', 'options.css');
    const outputFile = path.join(__dirname, 'fixtures', 'options.out.css');
    const inputCss = fs.readFileSync(inputFile);
    const options = {
        nobg: {onlyImages: true},
    };
    return postcss(plugin({modules: '*', resolveFromFile: true, options})).process(inputCss, {
        from: inputFile,
        to: outputFile,
    }).then(({css}) => {
        const normalized = css.replace(/\s+/g, ' ').trim();
        t.deepEqual(normalized, '.foo { } .bar { }', 'should remove only background image decls');
    });
});

test('should use specified options if specified options is not an object', t => {
    const inputFile = path.join(__dirname, 'fixtures', 'arrayOptions.css');
    const outputFile = path.join(__dirname, 'fixtures', 'arrayOptions.out.css');
    const inputCss = fs.readFileSync(inputFile);
    const options = {
        nobg: {onlyImages: true},
    };
    return postcss(plugin({modules: '*', resolveFromFile: true, options})).process(inputCss, {
        from: inputFile,
        to: outputFile,
    }).then(({css}) => {
        const normalized = css.replace(/\s+/g, ' ').trim();
        const expected = '.foo { background-image: url(/foo.jpg); } .bar { background: #bf1942; }';
        t.deepEqual(normalized, expected, 'should remove only background-repeat decls');
    });
});
