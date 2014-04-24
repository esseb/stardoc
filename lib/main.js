'use strict';

var _ = require('lodash');
var fs = require('fs');
var markdown = require('markdown').markdown;
var path = require('path');
var walk = require('walk');

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
  // The synchronous walker requires listeners to be listed before the object is
  // created.
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
 * Extract style comments from the given style string. A style guide comment is
 * a multiline comment that begins with /** ala JSDoc.
 * 
 * @param {String} style The content of a style file.
 * @return {Array}
 */
function readComments(style) {
  // This regex will fail if any content strings include /** or */.
  var comments = style.match(/(\/\*\*[\s\S]*?\*\/)/gm);

  if (!comments) {
    return [];
  }

  comments.forEach(function (comment, i) {
    comments[i] = cleanedComment(comment);
  });

  return comments;

  // TODO: Ignore /***+ https://github.com/jsdoc3/jsdoc/issues/215
}

/**
 * Strip leading and trailing whitespace, the comment start and end tags, and
 * the leading asterisk per line if there are any.
 *
 * @param {String} comment
 * @return {String} The cleaned comment.
 */
function cleanedComment(comment) {
  // https://github.com/jsdoc3/jsdoc/issues/215#issuecomment-9389993

  var lines = [];

  comment = comment.split(/\r\n|\n/);
  comment.forEach(function (line) {
    // Skip start/end tag lines entirely if there is nothing else on that line.
    if (line.match(/^\s*(\/\*\*|\*\/)\s*$/)) {
      return true;  // continue
    }

    // TODO: This will fail if any line inside the multiline comment begins with
    // /**. A proper parser is required to fix this.
    line = line.trim();
    line = line.replace(/^\*\s*/, '');    // Leading asterisk.
    line = line.replace(/^\/\*+/, '');    // Comment start tag.
    line = line.replace(/\*\/\s*$/, '');  // Comment end tag.
    line = line.trim();
    lines.push(line);
  });

  return lines.join('\n');
}

/**
 * Parse a style guide comment and return a style object containing its
 * description and parameters. Parameters with no value are set to "true".
 *
 * @param {String} comment
 * @return {Object}
 */
function parsedComment(comment) {
  // The description is everything up to the first line beginning with an @.
  var description = comment.match(/([\s\S]+?)(\r\n|\n)@/);
  if (description) {
    description = description[1].trim();
  }

  // Extract parameters, supporting values that span multiple lines.
  var parameters = {};
  var currentParameter;
  comment.split(/\r\n|\n/).forEach(function (line) {
    if (/^@/.test(line)) {
      var tokens = line.match(/^@(\w+)\s*(.+)?/);
      currentParameter = tokens[1];
      parameters[currentParameter] = tokens[2] ? tokens[2] : true;
    }
    else {
      if (currentParameter) {
        parameters[currentParameter] += ' ' + line;
      }
    }
  });

  if (!description && !parameters) {
    return;
  }

  return {
    originalDescription: description,
    description: markdown.toHTML(description),
    params: parameters
  };
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
      markupFolder, path.dirname(style.path), style.params.markup);
  
  if (!fs.existsSync(markupPath)) {
    throw new Error(markupPath + ' does not exist');
  }

  if (!fs.statSync(markupPath).isFile()) {
    throw new Error(markupPath + ' is not a file');
  }

  style.markup = fs.readFileSync(markupPath, 'utf8');
}

/**
 * Return an object with style objects sorted into categories, with modifiers
 * added as children to the style object they modify.
 * TODO: Handle category + name collisions.
 * TODO: Log error if an object has both @modifies and @name.
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

    if (style.params.modifies) {
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

  // Add style objects with @modifies parameters as children to the style object
  // they modify.
  styleObjects.forEach(function (style) {
    if (!style.params.modifies) {
      return true;  // continue
    }

    var parent = _.find(categories[style.params.category], function (element) {
      return style.params.modifies === element.params.name;
    });

    if (parent) {
      if (!parent.modifiers) {
        parent.modifiers = [];
      }

      parent.modifiers.push(style);
    }
  });

  return categories;
}

/**
 * ...
 * TODO: Rename this function.
 */
exports.run = function(options) {
  var styleFiles = findStyleFiles(options.styleFolder, options.styleIgnore);
  var styleObjects = [];

  styleFiles.forEach(function (file) {
    var styleContent = fs.readFileSync(file, 'utf8');
    var styleComments = readComments(styleContent);

    styleComments.forEach(function (comment) {
      var styleObject = parsedComment(comment);
      if (!styleObject) {
        return true;  // continue
      }

      styleObject.path = path.relative(options.styleFolder, file);
      getMarkup(options.markupFolder, styleObject);

      styleObjects.push(styleObject);
    });
  });

  styleObjects = categorizeStyleObjects(styleObjects);

  console.log('styleObjects', styleObjects);

  /*
  nunjucks.configure(options.templateFolder);

  // TODO: Magic filenames or read from config JSON?
  var styleguide = nunjucks.render('test.html', { styleObjects: styleObjects});
  var outputFile = path.join(options.outputFolder, 'styleguide.html');

  // Create the output folder (if it does not already exist.)
  // TODO: Handle error. Use promise?
  // TODO: http://howtonode.org/promises
  mkdirp.sync(options.outputFolder);

  // Copy the template's static folder over.
  // TODO: Use JSDoc style publish.js or something and move all markdowning,
  // templating, static folder copying, etc. over to the end user.
  ncp(
      path.join(options.templateFolder, 'static'),
      path.join(options.outputFolder, 'static'),
      function (err) {
    if (err) {
      console.error('Error copying over static folder.', err);
    }
  });
  
  // Write the generated styleguide.
  fs.writeFile(outputFile, styleguide, 'utf8', function (err) {
    if (err) {
      console.error('Error writing styleguide.', err);
    }
  });
  */
};