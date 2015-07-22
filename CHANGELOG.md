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
