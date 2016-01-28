module.exports = stardoc;

var async = require('async');
var fs = require('fs');
var glob = require('glob');
var path = require('path');

function stardoc(options, cb) {
  // TODO(scb): Verify options object.
  // options.include
  // options.exclude
  // options.generator

  glob(options.include, (err, files) => {
    if (err) {
      console.log('error', err);
      return;
    }

    async.map(files, getStardocBlocks, (err, results) => {
      if (err) {
        cb(err);
        return;
      }

      var stardocBlocks = [];
      results.forEach(result => {
        if (result) {
          stardocBlocks = stardocBlocks.concat(result);
        }
      });

      var object = createStardoc(stardocBlocks);
      options.generator(object.children);
    });
  });
}

function createStardoc(stardocBlocks) {
  var stardocObject = {};

  stardocBlocks.forEach(block => {
    createStardocObject(stardocObject, {
      id: block.parameters.id,
      title: block.parameters.title,
      description: block.description,
      markup: block.markup
    });
  });

  return stardocObject;
}

/**
 * Return an object from the stardoc object matching the given id, creating the
 * object, along with any parents, if it does not already exist.
 *
 * @param {Object} stardocObject
 * @param {Object} options
 */
function createStardocObject(stardocObject, options) {
  var tokens = options.id.split('/');

  var object = stardocObject;
  for (var i = 0; i < tokens.length; i++) {
    var key = tokens[i];

    var children = object.children = object.children || [];
    var child = children.find(child => {
      return child.key === key;
    });

    if (child) {
      object = child;
      continue;
    }

    var object = {
      key: key
    };

    children.push(object);

    children.sort((a, b) => {
      if (a.key < b.key) {
        return -1;
      }

      if (a.key > b.key) {
        return 1;
      }

      return 0;
    });
  }

  object.id = options.id;
  object.title = options.title || null;
  object.description = options.description || null;
  object.markup = options.markup || null;

  return object;
}

/**
 * For the given style file, read the contents and return the stardoc blocks as
 * an array.
 * @return {Array}
 */
function getStardocBlocks(filePath, cb) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      cb(err);
      return;
    }

    // Find comment blocks starting with <slash><star><star> and
    // ending with <star><slash>.
    var blocks = data.match(/^(\/\*\*[\s\S]*?\*\/)/gm);

    if (blocks === null) {
      cb(null, null);
      return;
    }

    async.map(blocks, parseCommentBlock, (err, results) => {
      if (err) {
        cb(err);
        return;
      }

      var dirname = path.dirname(filePath);

      // Filter out null results.
      results = results.filter(result => !!result);

      async.map(results, readMarkup.bind(null, dirname), (err, results) => {
        if (err) {
          cb(err);
          return;
        }

        cb(null, results);
      });
    });
  });
}


function readMarkup(dirname, stardocBlock, cb) {
  if (!stardocBlock.parameters.markup) {
      cb(null, stardocBlock);
      return;
  }

  var markupPath = path.resolve(
    path.join(dirname, stardocBlock.parameters.markup)
  );

  fs.stat(markupPath, (err, stats) => {
    if (err) {
      cb(err);
      return;
    }

    if (stats.isFile() === false) {
      cb('Error: "' + markupPath + '" is not a file');
      return;
    }

    fs.readFile(markupPath, 'utf8', (err, data) => {
      if (err) {
        cb('Error: Could not read "' + filePath + '": ' + err);
        return;
      }

      stardocBlock.markup = data;

      cb(null, stardocBlock);
    });
  });
}

/**
 * Parse the given comment block and return or null if the block is not a valid
 * stardoc comment.
 */
function parseCommentBlock(block, cb) {
  var lines = block.split(/[\r\n|\n]/);

  // Verify that the comment block begins with <slash><star><star>.
  if (lines.shift() !== '/**') {
    cb(null, null);
    return;
  }

  // Verify that the comment block end with <space><star><slash>.
  if (lines.pop() !== ' */') {
    cb(null, null);
    return;
  }

  // Verify that each line begins with <space><star> and an optional <space>
  // and strip those characters.
  var rLineStart = / \* ?/;
  for (var i = 0; i < lines.length; i++) {
    if (rLineStart.test(lines[i]) === false) {
      cb(null, null);
      return;
    }

    lines[i] = lines[i].replace(rLineStart, '');
  }

  // Find the line where the parameter block begins.
  var parametersStartIndex = 0;
  for (var i = lines.length - 1; i >= 0; i--) {
    if (lines[i].indexOf('@') !== 0) {
      parametersStartIndex = i + 1;
      break;
    }
  }

  // Concatenate the top description block. All lines above the parameter block
  // is part of the description.
  var description = '';
  for (var i = 0; i < parametersStartIndex; i++) {
    description += lines[i] + '\n';
  }

  // Parse the "@key value" parameters.
  var parameters = {};
  for (var i = parametersStartIndex; i < lines.length; i++) {
    var tokens = lines[i].match(/^@([^\s]+) (.+)$/);
    var key = tokens[1];
    var value = tokens[2];

    parameters[key] = value;
  }

  // Verify that the "id" key exist, which is the only required key.
  if (parameters.id === 'undefined') {
    cb(null, null);
  }

  var key = parameters.id.split('/').pop();

  cb(null, {
    key: key,
    description: description,
    parameters: parameters
  });
}

/**
 * @return {Array}
 */
function getMarkup(file, cb) {
  fs.readFile(file, 'utf8');
}
