'use strict';

var fs = require('fs');
var mkdirp = require('mkdirp');
var nunjucks = require('nunjucks');
var path = require('path');

/**
 * @param {Object} styleObjects
 * @param {String} outputFolder
 * @param {Object} templateOptions
 */
exports.publish = function(styleObjects, outputFolder, templateOptions) {
  nunjucks.configure(__dirname);

  // Create the main styleguide file.
  var styleguide = nunjucks.render(
      'index.html', { styleObjects: styleObjects});
  writeFile(outputFolder, 'index.html', styleguide);

  // Create example file for each module.
  styleObjects.module.forEach(function (module) {
    var modfile = nunjucks.render('module.html', {module: module});
    var modpath = path.join(outputFolder, module.category);
    writeFile(modpath, module.name + '.html', modfile);

    // TODO: Generate example files for each child also.
  });
};

/**
 * @param {String} outputFolder
 * @param {String} filename
 * @param {String} content
 */
function writeFile(outputFolder, filename, content) {
  var outputFile = path.join(outputFolder, filename);

  mkdirp.sync(outputFolder);

  fs.writeFile(outputFile, content, 'utf8', function (err) {
    if (err) {
      console.error('Error writing ' + filename + '.', err);
    }
  });
}