'use strict';

var fs = require('fs');
var nunjucks = require('nunjucks');
var path = require('path');

/**
 * @param {Object} styleObjects
 * @param {String} outputFolder
 * @param {Object} templateOptions
 */
exports.publish = function(styleObjects, outputFolder, templateOptions) {
  var outputFile = path.join(outputFolder, 'styleguide.html');

  nunjucks.configure(__dirname);
  var styleguide = nunjucks.render('test.html', { styleObjects: styleObjects});
  
  // Write the generated styleguide.
  fs.writeFile(outputFile, styleguide, 'utf8', function (err) {
    if (err) {
      console.error('Error writing styleguide.', err);
    }
  });
};