#!/usr/bin/env node
'use strict';

var _ = require('lodash');
var fs = require('fs');
var Liftoff = require('liftoff');
var mkdirp = require('mkdirp');
var ncp = require('ncp').ncp;
var path = require('path');
var walk = require('walk');

var parser = require('../lib/parser');

var cli = new Liftoff({
  name: 'stardoc',
  configName: 'stardoc',
});

cli.launch(handleArguments);

function handleArguments(env) {
  if (!env.configPath) {
    console.log('No stardoc config file found');
    process.exit(1);
  }

  // Read the stardoc config file.
  var data = require(env.configPath);

  // TODO: Warn if anything is missing.
  var styleFolder = path.join(env.configBase, data.styleFolder);
  var markupFolder = path.join(env.configBase, data.markupFolder);
  var outputFolder = path.join(env.configBase, data.outputFolder);
  var templateFolder = path.join(env.configBase, data.templateFolder);
  var styleIgnore = data.styleIgnore;

  run({
    styleFolder: styleFolder,
    markupFolder: markupFolder,
    outputFolder: outputFolder,
    templateFolder: templateFolder,
    styleIgnore: styleIgnore
  });
}

/**
 * Check if the given filename is a valid style file.
 *
 * @param {String} fileName
 * @param {String} styleIgnore
 * @return {Boolean}
 */
function isStyleFile(fileName, styleIgnore) {
  var styleExtensions = [
    '.css',
    '.scss',
    '.sass',
    '.less',
    '.styl'
  ];

  if (styleExtensions.indexOf(path.extname(fileName)) == -1) {
    return false;
  }

  // TODO: styleIgnore can be either a single string or an array of strings.
  // TODO: Use globs instead?
  if (path.basename(fileName) == styleIgnore) {
    return false;
  }

  return true;
}

/**
 * Return a list of all style files inside the given root directory.
 *
 * @param {String} root
 * @param {String} styleIgnore
 * @return {Array}
 */
function findStyleFiles(root, styleIgnore) {
  if (!fs.existsSync(root)) {
    throw new Error(root + ' does not exist');
  }

  if (!fs.statSync(root).isDirectory()) {
    throw new Error(root + ' is not a directory');
  }

  var styleFiles = [];

  // TODO: Use glob instead?
  // The synchronous walker requires listeners to be listed before the object
  // is created.
  var options = {
    followLinks: false,
    listeners: {
      file: function(root, fileStats, next) {
        if (isStyleFile(fileStats.name, styleIgnore)) {
          styleFiles.push(root + '/' + fileStats.name);
        }

        next();
      }
    }
  };

  walk.walkSync(root, options);

  return styleFiles;
}

/**
 * Read the markup for the given style object and store it.
 *
 * @param {String} markupFolder The markup root folder.
 * @param {Object} style The style object.
 */
function getMarkup(markupFolder, style) {
  if (!style.params.markup) {
    return;
  }

  var markupPath = path.join(
      markupFolder, style.directory, style.params.markup);
  
  if (!fs.existsSync(markupPath)) {
    throw new Error(markupPath + ' does not exist');
  }

  if (!fs.statSync(markupPath).isFile()) {
    throw new Error(markupPath + ' is not a file');
  }

  return fs.readFileSync(markupPath, 'utf8');
}

/**
 * Return an object with style objects sorted into categories and children.
 * TODO: Handle category + name collisions.
 * TODO: Log error if an object has both @parent and @name.
 *
 * @param {Aray} styleObjects
 * @return {Object}
 */
function categorizeStyleObjects(styleObjects) {
  var categories = {};

  // Sort styleObjects into categories.
  styleObjects.forEach(function (style) {
    if (!style.params.category) {
      return true;  // continue
    }

    if (style.params.parent) {
      // TODO: Log error
      return true;  // continue
    }

    if (!categories[style.params.category]) {
      categories[style.params.category] = [];
    }

    categories[style.params.category].push(style);
  });

  // Sort style objects in each category by name.
  for (var category in categories) {
    categories[category].sort(function (a, b) {
      if (a.params.name < b.params.name) {
        return -1;
      }

      if (a.params.name > b.params.name) {
        return 1;
      }
      
      return 0;
    });
  }

  // Add style objects with @parent parameters as children to their parent
  // style object
  styleObjects.forEach(function (style) {
    if (!style.params.parent) {
      return true;  // continue
    }

    var parent = _.find(categories[style.params.category], function (element) {
      return style.params.parent === element.params.name;
    });

    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }

      parent.children.push(style);
    }
  });

  return categories;
}

/**
 * ...
 * TODO: Rename this function.
 */
function run(options) {
  var styleFiles = findStyleFiles(options.styleFolder, options.styleIgnore);
  var styleObjects = [];

  styleFiles.forEach(function (file) {
    var stylePath = path.relative(options.styleFolder, file);
    styleObjects = styleObjects.concat(
        parser.parseStyleFile(options.styleFolder, stylePath));
  });

  styleObjects.forEach(function (styleObject) {
    var markup = getMarkup(options.markupFolder, styleObject);
    styleObject.markup = markup;
  });

  styleObjects = categorizeStyleObjects(styleObjects);

  // Create the output folder (if it does not already exist.)
  // TODO: Handle error. Use promise?
  // TODO: http://howtonode.org/promises
  mkdirp.sync(options.outputFolder);

  // Copy the template's static folder over.
  // TODO: Only if stardoc.json specifies a static folder.
  ncp(
      path.join(options.templateFolder, 'static'),
      path.join(options.outputFolder, 'static'),
      function (err) {
    if (err) {
      console.error('Error copying over static folder.', err);
    }
  });

  // Call the template's publish function.
  var template = require(options.templateFolder + '/publish.js');
  template.publish(
      styleObjects, options.outputFolder, options.templateOptions);
};