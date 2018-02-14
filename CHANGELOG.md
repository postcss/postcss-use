# 3.0.0

* postcss-use now uses commas instead of semicolons to separate options in
  order to support PostCSS 6.
* Removed: Dependencies on `balanced-match` and `lodash.isplainobject`.
* Updated: `postcss` from 5 to 6.
* Updated: `resolve-from` from 2 to 4.

# 2.3.0

* postcss-use now accepts an object of default options to supply to plugins
  passed to PostCSS via the @use rule (thanks to @rexxars).

# 2.2.0

* postcss-use will now throw a more descriptive error when failing to load a
  plugin via the `resolveFromFile` option (thanks to @rexxars).
* Now compiled with Babel 6.

# 2.1.0

* Added `resolveFromFile` option (thanks to @rexxars).

# 2.0.2

* postcss-use no longer uses the old `Node#removeSelf` method from PostCSS 4,
  replaced with `Node#remove` (thanks to @TrySound).

# 2.0.1

* Corrected repository link (thanks to @MoOx).
* Reduced size of package with npm files filter (thanks to @TrySound).
* Fixed lint errors.

# 2.0.0

* Changes: Use PostCSS 5.0 API(Fix[#5](https://github.com/postcss/postcss-use/issues/5)).

# 1.2.1

* Fixes a behaviour where plugins would be loaded/unloaded globally instead of
  per-file.

# 1.2.0

* Adds `'*'` as a legal value to `modules`, to lift the restrictions on
  whitelisting module loading. This is to enable use cases for postcss-use
  outside browser environments.

# 1.1.0

* Adds a more *CSS-like* block syntax - `@use {option: value}`.

# 1.0.2

* Fixes a crash when multiple options were specified.

# 1.0.1

* Fixes a bug where postcss-use was not properly injecting plugins into the
  processor instance from a plugin pack.

# 1.0.0

* Initial release.
