#!/usr/bin/env node

var program = require('commander');
var path = require('path');
var fs = require('fs');

// TODO: Mark the ones that are required.
program
  .version('0.0.0')
  .option('-s, --style [folder]', 'Style root folder')
  .option('-m, --markup [folder]', 'Markup root folder')
  .option('-t, --template [folder]', 'Template folder')
  .option('-o, --output [folder', 'Where to save the generated styleguide')
  .option('-i, --ignore', 'Style files to ignore')
  .parse(process.argv);

// TODO: Get this from the command line parameters.
var styleFolder = path.normalize('files/less');
var markupFolder = path.normalize('files/markup');
var outputFolder = path.normalize('files/styleguide');
var templateFolder = path.normalize('files/template');
var styleIgnore = '_normalize.less';

// TODO: Is this a sane way to split up the CLI part and the main code?
var lib = path.join(path.dirname(fs.realpathSync(__filename)), '../lib');
require(lib + '/main').run({
  styleFolder: styleFolder,
  markupFolder: markupFolder,
  outputFolder: outputFolder,
  templateFolder: templateFolder,
  styleIgnore: styleIgnore
});