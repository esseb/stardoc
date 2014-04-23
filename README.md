Stardoc
===========

Test usage:
* Install NodeJS
* Navigate to the `styleguider` folder
* `npm install`
* `node .\bin\styleguider.js`
* The generated styleguide is in the `files/styleguide` folder

All paths are hardcoded at the moment. To use other paths edit `styleguider.js`.

Add your own CSS comments:
* Navigate to the `styleguider/files` folder
* `npm install`
* Add/edit `.less` files in the `less` folder
* `grunt less` or `grunt watch` to compile the less files
* Execute `styleguider.js` again for an updated styleguide

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

Edit the styleguide template:
The styleguide template in `files/template` uses the
[nunjucks templating engine](https://github.com/mozilla/nunjucks). Currently
only one template file is supported in which all style objects must be listed.
Ideally users should be able to generate one file per category if they wish.