'use strict';

var path = require('path');
var postcss = require('postcss');
var balanced = require('balanced-match');
var resolveFrom = require('resolve-from');

function trim (value) {
    return value.trim();
}

function pluginOptsFromRule (rule) {
    var options = {};
    var index = -1;
    var node;
    // Extra parentheses to fix JSHint
    while ((node = rule.nodes && rule.nodes[++index])) {
        if (node.type === 'decl') {
            try {
                options[node.prop] = JSON.parse(node.value);
            } catch (e) {
                options[node.prop] = node.value;
            }
        } else if (node.type === 'rule') {
            options[node.selector] = pluginOptsFromRule(node);
        }
    }
    return options;
}

module.exports = postcss.plugin('postcss-use', function (opts) {
    opts = opts || {};
    return function (css, result) {
        if (!opts.modules) {
            throw new Error('postcss-use must be configured with a whitelist of plugins.');
        }
        var origin = result.processor.plugins.slice();
        css.walkAtRules('use', function (rule) {
            var pluginOpts;
            var plugin = trim(rule.params);
            var match = balanced('(', ')', rule.params);
            if (!match) {
                if (~rule.params.indexOf('(')) {
                    var params = rule.params + ';';
                    var next = rule.next();
                    while (next && next.type === 'decl') {
                        params += String(next);
                        next = next.next();
                        next.prev().remove();
                    }
                    match = balanced('(', ')', params);
                } else {
                    pluginOpts = pluginOptsFromRule(rule);
                }
            }
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
            if (~opts.modules.indexOf(plugin) || opts.modules === '*') {
                var pluginPath;
                if (opts.resolvePluginsRelativeToFile && rule.source.input.file) {
                    pluginPath = resolveFrom(path.dirname(rule.source.input.file), plugin);
                }

                var instance = require(pluginPath || plugin)(pluginOpts);
                if (instance.plugins) {
                    instance.plugins.forEach(function (p) {
                        result.processor.plugins.push(p);
                    });
                } else {
                    result.processor.plugins.push(instance);
                }
            } else {
                throw new ReferenceError(plugin + ' is not a valid postcss plugin.');
            }
            rule.remove();
        });
        result.processor.plugins.push(postcss.plugin('postcss-use#reset', function () {
            return function (styles, res) {
                res.processor.plugins = origin;
            };
        })());
    };
});
