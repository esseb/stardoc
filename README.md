Stardoc
=======

Test usage:
* Install NodeJS
* Navigate to the `stardoc` folder
* `npm install`
* Stardoc can now be executed by calling `node STARDOC_FOLDER\bin\stardoc.js`

Example project:
* Navigate to the `files` folder
* `npm install`
* Add/edit `.less` files in the `less` folder
* `grunt less` or `grunt watch` to compile the less files if needed
* Run `stardoc.js` from the `files` folder

Styleguide comments begin with /**. The first string inside the comment block
is the style's description. The publish function in the example project parses
this description as markdown.

Parameters follow the description and start with an `@`. Supported parameters
at the moment are `title`, `id`, `parent`, and `markup`:
* `title` is the title used to refer to the style object.
* `id` is the `category` and `name` of the style object, separate with a /.
  Valid characters are [_a-zA-Z0-9-]+
  The `category` is used to collect various style objects together. For example
  'module' and 'component', or 'quark' and 'atom', or 'form' and 'layout'.
* `parent` is used for styles that modifies another style object. The string
  must match the `name` part of an `id` parameter of a style object with the
  same category.
* `markup` is the filename of a file containing only the markup needed to test
  the CSS for the style.