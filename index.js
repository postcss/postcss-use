'use strict';

var postcss = require('postcss');
var balanced = require('balanced-match');

function trim (value) {
    return value.trim();
}

module.exports = postcss.plugin('postcss-use', function (opts) {
    opts = opts || {};
    return function (css, result) {
        if (!opts.modules) {
            throw new Error('postcss-use must be configured with a whitelist of plugins.');
        }
        css.eachAtRule('use', function (rule) {
            var pluginOpts;
            var plugin = trim(rule.params);
            var match = balanced('(', ')', rule.params);
            if (match) {
                var body = match.body;
                if (~body.indexOf('function')) {
                    throw new SyntaxError('Functions are not supported by postcss-use.');
                }
                if (!body.indexOf('[')) {
                    if (body.lastIndexOf(']') === body.length - 1) {
                        pluginOpts = JSON.parse(body);
                    } else {
                        throw new SyntaxError('Invalid option "' + body + '"');
                    }
                } else {
                    body = body.split(';');
                    pluginOpts = body.reduce(function (config, option) {
                        var parts = option.split(':').map(trim);
                        if (!parts[1]) {
                            throw new SyntaxError('Invalid option "' + parts[0] + '"');
                        }
                        config[parts[0]] = JSON.parse(parts[1]);
                        return config;
                    }, {});
                }
                plugin = trim(match.pre);
            }
            // Remove any directory traversal
            plugin = plugin.replace(/\.\/\\/g, '');
            if (opts.modules && ~opts.modules.indexOf(plugin)) {
                var instance = require(plugin)(pluginOpts);
                if (instance.plugins) {
                    instance.plugins.forEach(function (plugin) {
                        result.processor.plugins.push(plugin);
                    });
                } else {
                    result.processor.plugins.push(instance);
                }
            } else {
                throw new ReferenceError(plugin + ' is not a valid postcss plugin.');
            }
            rule.removeSelf();
        });
    };
});
