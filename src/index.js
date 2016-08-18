import path from 'path';
import postcss from 'postcss';
import balanced from 'balanced-match';
import resolveFrom from 'resolve-from';
import isPlainObject from 'lodash.isplainobject';

const NAME = 'postcss-use';

const assign = Object.assign || function (target) {
    for (let i = 1; i < arguments.length; i++) {
        const source = arguments[i];
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
};

function invalidOption (option) {
    throw new SyntaxError(`Invalid option '${option}'`);
}

function trim (value) {
    return value.trim();
}

function pluginOptsFromRule (rule) {
    const options = {};
    let index = -1;
    let node;
    while (node = rule.nodes && rule.nodes[++index]) {
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

function mergePluginOptions (plugin, defaultOpts, specifiedOpts) {
    // Don't merge anything but objects
    if (!isPlainObject(specifiedOpts) || !isPlainObject(defaultOpts)) {
        return specifiedOpts;
    }

    // If both the default and specified options are plain objects, we can merge them
    return assign({}, defaultOpts, specifiedOpts);
}

export default postcss.plugin(NAME, (opts = {}) => {
    return (css, result) => {
        if (!opts.modules) {
            throw new Error(`${NAME} must be configured with a whitelist of plugins.`);
        }
        const origin = result.processor.plugins.slice();
        css.walkAtRules('use', rule => {
            let pluginOpts;
            let plugin = trim(rule.params);
            let match = balanced('(', ')', rule.params);
            if (!match) {
                if (~rule.params.indexOf('(')) {
                    let params = rule.params + ';';
                    let next = rule.next();
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
                let body = match.body;
                if (!body.indexOf('[')) {
                    if (body.lastIndexOf(']') === body.length - 1) {
                        pluginOpts = JSON.parse(body);
                    } else {
                        invalidOption(body);
                    }
                } else {
                    body = body.split(';');
                    pluginOpts = body.reduce((config, option) => {
                        let parts = option.split(':').map(trim);
                        if (!parts[1]) {
                            invalidOption(parts[0]);
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
                let pluginPath = plugin;
                if (opts.resolveFromFile && rule.source.input.file) {
                    pluginPath = resolveFrom(path.dirname(rule.source.input.file), plugin);
                }

                if (!pluginPath) {
                    throw new Error(`Cannot find module '${plugin}'`);
                }

                let optsName = plugin.replace(/^postcss-/, '');
                let defaultOpts = (opts.defaultPluginOptions && opts.defaultPluginOptions[optsName]) || {};
                let mergedOptions = mergePluginOptions(optsName, defaultOpts, pluginOpts);
                let instance = require(pluginPath)(mergedOptions);
                if (instance.plugins) {
                    instance.plugins.forEach((p) => {
                        result.processor.plugins.push(p);
                    });
                } else {
                    result.processor.plugins.push(instance);
                }
            } else {
                throw new ReferenceError(`'${plugin}' is not a valid postcss plugin.`);
            }
            rule.remove();
        });
        result.processor.plugins.push(postcss.plugin(`${NAME}#reset`, () => {
            return (styles, res) => (res.processor.plugins = origin);
        })());
    };
});
