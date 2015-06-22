'use strict';

var postcss = require('postcss');
var balanced = require('balanced-match');

function trim (value) {
    return value.trim();
}

module.exports = postcss.plugin('postcss-use', function (opts) {
    opts = opts || {};
    if (!opts.modules) {
        throw new Error('postcss-use must be configured with a whitelist of plugins.');
    }
    return function (css, result) {
        css.eachAtRule('use', function (rule) {
            var moduleOpts;
            var module = trim(rule.params);
            var match = balanced('(', ')', rule.params);
            if (match) {
                var body = match.body;
                if (~body.indexOf('function')) {
                    throw new SyntaxError('Functions are not supported by postcss-use.');
                }
                if (!body.indexOf('[')) {
                    if (body.lastIndexOf(']') === body.length - 1) {
                        moduleOpts = JSON.parse(body);
                    } else {
                        throw new SyntaxError('Invalid option "' + body + '"');
                    }
                } else {
                    body = body.split(';');
                    moduleOpts = body.reduce(function (config, option) {
                        var parts = option.split(':').map(trim);
                        if (!parts[1]) {
                            throw new SyntaxError('Invalid option "' + parts[0] + '"');
                        }
                        config[parts[0]] = JSON.parse(parts[1]);
                        return config;
                    }, {});
                }
                module = trim(match.pre);
            }
            // Remove any directory traversal
            module = module.replace(/\.\/\\/g, '');
            if (opts.modules && ~opts.modules.indexOf(module)) {
                result.processor.plugins.push(require(module)(moduleOpts));
            } else {
                throw new ReferenceError(module + ' is not a valid postcss plugin.');
            }
            rule.removeSelf();
        });
    };
});
