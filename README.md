Stardoc
=======

Test usage:
* Install NodeJS
* Navigate to the `stardoc` folder
* `npm install`
* `node .\bin\stardoc.js`
* Currently nothing gets generated, but you can look at the lovely debug output

Add your own CSS comments:
* Navigate to the `files` folder
* `npm install`
* Add/edit `.less` files in the `less` folder
* `grunt less` or `grunt watch` to compile the less files
* Execute `stardoc.js` again

Styleguide comments begin with /**. The first string inside the comment block is
the style's description (markdown.)

Parameters follow the description and start with an `@`. Supported parameters at
the moment are `name`, `markup`, `category`, and `modifies`:
* `name` is the name of the style object.
* `markup` is the filename of a file containing only the markup needed to test
  the CSS for the style.
* `category` is used to collect various style objects together. For example
  'module' and 'component', or 'quark' and 'atom', or 'form' and 'layout'.
  Whatever suits your need.
* `modifies` is used for styles that modifies another style object. The name
  must match a `name` parameter of style object with the same category.