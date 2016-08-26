# [postcss][postcss]-use [![Build Status](https://travis-ci.org/postcss/postcss-use.svg?branch=master)][ci]

> Enable PostCSS plugins directly in your stylesheet.

## Install

With [npm](https://npmjs.org/package/postcss-use) do:

```
npm install postcss-use --save
```

## Example

Both hash maps and arrays are supported; note that functions are not, for
security reasons. A hash map uses the CSS format of
`option: value; option2: value2`, but please note that *values* must be valid
JSON syntax. For example if a module takes a string option, it must be wrapped
in quotation marks.

### Input

#### Standard syntax

With [postcss-discard-comments]:

```css
@use postcss-discard-comments(removeAll: true);
/*! test */
h1 {
    color: red
}
```

#### Alternative syntax

You may also use configuration blocks that are more *CSS-like*. Note that array
options cannot be parsed by this method.

```css
@use postcss-discard-comments {
    removeAll: true
}
```

### Output

```css
h1 {
    color: red
}
```

## API

### use(options)

#### options

##### modules

Type: `array|string`
*Required option*.

You must specify this array of postcss plugins to use, for security purposes.
This prevents malicious usage of postcss-use in browser environments.

```js
postcss([ use({ modules: ['autoprefixer', 'cssnano', 'cssnext']}) ]);
```

Note that you may also set this option to `'*'` to disable whitelisting of
modules. This is not recommended for environments where you may be accepting
arbitrary user input; use at your own risk.

##### resolveFromFile

Type: `boolean` (default: `false`)

Set this to true in order to resolve plugins relative to the file that
referenced them. This enables the usage of different versions of the same
plugin, for instance.

```js
postcss([ use({ resolveFromFile: true, modules: '*' }) ]);
```

##### options

Type: `object` (default: `{}`)

Default options for plugins, keyed by plugin name. If both the default and the specified options are objects, they are merged. Otherwise, the options specified in the CSS are used.

```js
postcss([
    use({
        modules: '*',
        options: {
            autoprefixer: {
                browsers: ['> 1%', 'IE 7']
            }
        }
    })
]);
```

## Usage

See the [PostCSS documentation](https://github.com/postcss/postcss#usage) for
examples for your environment.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| [<img src="https://avatars.githubusercontent.com/u/1282980?v=3" width="100px;"/><br /><sub>Ben Briggs</sub>](http://beneb.info)<br />[💻](https://github.com/postcss/postcss-use/commits?author=ben-eb) [📖](https://github.com/postcss/postcss-use/commits?author=ben-eb) 👀 [⚠️](https://github.com/postcss/postcss-use/commits?author=ben-eb) | [<img src="https://avatars.githubusercontent.com/u/188426?v=3" width="100px;"/><br /><sub>Jonathan Neal</sub>](//jonathantneal.com)<br />[💻](https://github.com/postcss/postcss-use/commits?author=jonathantneal) [⚠️](https://github.com/postcss/postcss-use/commits?author=jonathantneal) | [<img src="https://avatars.githubusercontent.com/u/2784308?v=3" width="100px;"/><br /><sub>一丝</sub>](www.iyunlu.com/view)<br />[💻](https://github.com/postcss/postcss-use/commits?author=yisibl) | [<img src="https://avatars.githubusercontent.com/u/157534?v=3" width="100px;"/><br /><sub>Maxime Thirouin</sub>](https://moox.io/)<br />[📖](https://github.com/postcss/postcss-use/commits?author=MoOx) | [<img src="https://avatars.githubusercontent.com/u/5635476?v=3" width="100px;"/><br /><sub>Bogdan Chadkin</sub>](https://github.com/TrySound)<br />[📖](https://github.com/postcss/postcss-use/commits?author=TrySound) 👀 | [<img src="https://avatars.githubusercontent.com/u/48200?v=3" width="100px;"/><br /><sub>Espen Hovlandsdal</sub>](https://espen.codes/)<br />[💻](https://github.com/postcss/postcss-use/commits?author=rexxars) [⚠️](https://github.com/postcss/postcss-use/commits?author=rexxars) | [<img src="https://avatars.githubusercontent.com/u/19343?v=3" width="100px;"/><br /><sub>Andrey Sitnik</sub>](http://sitnik.ru)<br />👀 |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors] specification. Contributions of
any kind welcome!

## License

MIT © [Ben Briggs](http://beneb.info)


[all-contributors]: https://github.com/kentcdodds/all-contributors
[ci]:      https://travis-ci.org/postcss/postcss-use
[postcss]: https://github.com/postcss/postcss
[postcss-discard-comments]: https://github.com/ben-eb/postcss-discard-comments
