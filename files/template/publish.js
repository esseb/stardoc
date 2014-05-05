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
  console.log('styleObjects', styleObjects);
  var outputFile = path.join(outputFolder, 'index.html');

  nunjucks.configure(__dirname);
  var styleguide = nunjucks.render('index.html', { styleObjects: styleObjects});
  
  // Write the generated styleguide.
  fs.writeFile(outputFile, styleguide, 'utf8', function (err) {
    if (err) {
      console.error('Error writing styleguide.', err);
    }
  });
};