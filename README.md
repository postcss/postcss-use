# [postcss][postcss]-use [![Build Status](https://travis-ci.org/postcss/postcss-use.svg?branch=master)][ci]

> Enable PostCSS plugins directly in your stylesheet.

```css
@use postcss-preset-env(stage: 0, browsers: "last 2 versions");

h1 {
  & a {
    color: red
  }
}
```

## Install

With [npm](https://npmjs.org/package/postcss-use) do:

```
npm install postcss-use --save
```

## Example

Options may be passed into plugins as a JSON object, an array, a hash map, or
as declarations. Hash maps will follow the format of
`option: value, option2: value2`.

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

You may also use configuration blocks that are more *CSS-like*. Note that root
array options cannot be parsed by this method.

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

The `modules` option specifies a list of allowable PostCSS Plugins, expressed
as a `String`, `Array`, or `RegExp`. By default, all plugins are disabled in
order to prevent malicious usage in browser environments.

```js
use({
  // allow plugins starting with autoprefixer, postcss, precss, and cssnano
  modules: [
    /^autoprefixer/,
    /^postcss/,
    /^precss/,
    /^cssnano/
  ]
})
```

```js
use({
  // allow autoprefixer, postcss-preset-env, and postcss-flexbugs-fixes
  modules: [ 'autoprefixer', 'postcss-preset-env', 'postcss-flexbugs-fixes' ]
})
```

Setting the option to `"*"` will allow PostCSS Use to require any plugins. This
is not recommended for environments where you may be accepting arbitrary user
input; use at your own risk.

##### resolveFromFile

Type: `boolean` (default: `false`)

The `resolveFromFile` option specifies whether plugins should be resolved
relative to the file that referenced them. This may be used to enable the usage
of different versions of the same plugin. By default, it is disabled.

```js
use({
  resolveFromFile: true
})
```

##### options

Type: `object` (default: `{}`)

The `options` option specifies individual options for specific plugins by
plugin name.

```js
use({
  options: {
    'postcss-preset-env': {
      stage: 0,
      browsers: 'last two versions'
    }
  }
})
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
