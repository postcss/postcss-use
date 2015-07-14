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

### Output

```css
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

## API

### use(options)

#### options

##### modules

Type: `array`
*Required option*.

You must specify this array of postcss plugins to use, for security purposes.
This prevents malicious usage of postcss-use in browser environments.

```js
postcss([ use({ modules: ['autoprefixer', 'cssnano', 'cssnext']}) ]);
```

## Usage

See the [PostCSS documentation](https://github.com/postcss/postcss#usage) for
examples for your environment.

## Contributing

Pull requests are welcome. If you add functionality, then please add unit tests
to cover it.

## License

MIT © [Ben Briggs](http://beneb.info)

[ci]:      https://travis-ci.org/postcss/postcss-use
[postcss]: https://github.com/postcss/postcss
[postcss-discard-comments]: https://github.com/ben-eb/postcss-discard-comments
