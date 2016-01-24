# Stardoc

Stardoc comments begin with `/**` and end with ` */`. All lines within the
stardoc comment currently must start with ` *`. The parser is a little
unforgiving for now.

The first section of a Stardoc comment, up to the first parameter, is the
style's description. Descriptions are optional.

Parameters follow the description and begin with an `@`.

Supported parameters at the moment are `title`, `id`, and `markup`:
* `title` is the title used to refer to the style object.
* `id` is the `category` and `name` of the style object, separated with a `/`.
  * **required**
* `markup` is the path to a file containing only the markup needed to test
  the CSS for the style. The path should be relative to the location of the CSS
  file.

Stardoc is not meant to be used alone. Stardoc passes the data it collects
along to the given generator. No single generator could fit all projects that
need style documentation. Stardoc users are instead expected to create their
own, custom, generators, to fit their needs. The example generators, published
with an MIT license, can be used as a starting point.

## Usage
```
var stardoc = require('stardoc');
var generator = require('stardoc-generator-example');

var generatorOptions = {
  title: 'Foobar Styleguide',
  template: {
    main: 'templates/main.html'
  }
};

var stardocOptions = {
  include: 'css/**/*.less',
  generator: generator(generatorOptions)
}

stardoc(stardocOptions, function(err) {
  // Handle error here.
});
```

## Example
### main.css
```
/**
 * Small, stand-alone, elements. Generally used for single elements with no
 * children.
 *
 * @title Atoms
 * @id atoms
 */
@import "atoms/button";
@import "atoms/";

/**
 * Larger elements with more complex markup than atoms. Can contain atoms.
 *
 * @title Modules
 * @id Modules
 */
@import "modules/breadcrumb";
@import "modules/comment";
```

### atoms/button.css
```
/**
 * Standard button menu.
 *
 * @title Button
 * @id modules/button
 * @markup button/button.html
 */
.button {
  background-color: aliceblue;
  border: 0;
  color: black;
  margin: 0;
  padding: 0;
}

/**
 * Button variant to use when indicating that a button's actions perform a
 * dangerous action.
 *
 * @title Button ()
 * @id modules/button/button--danger
 * @markup button/button--danger.html
 */
.button--danger {
  background-color: red;
}
```

### modules/button/button.html
```
<button class="button">Button</button>
```

### modules/button/button--danger.html
```
<button class="button button--danger">Button</button>
```
