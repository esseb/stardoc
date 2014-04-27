'use strict';

var fs = require('fs');
var markdown = require('markdown').markdown;
var path = require('path');

/**
 *
 *
 * @param {String} styleFolder
 * @param {String} stylePath
 * @return {Array}
 */
exports.parseStyleFile = function(styleFolder, stylePath) {
  var styleObjects = [];
  var styleFile = path.join(styleFolder, stylePath);
  var styleContent = fs.readFileSync(styleFile, 'utf8');
  var styleComments = readComments(styleContent);

  styleComments.forEach(function (comment) {
    var styleObject = parsedComment(comment);
    if (!styleObject) {
      return true;  // continue
    }

    styleObject.styleFolder = styleFolder;
    styleObject.stylePath = stylePath;
    styleObjects.push(styleObject);
  });

  return styleObjects;
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

    // TODO: This will fail if any line inside the multiline comment begins
    // with /**. A proper parser is required to fix this.
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