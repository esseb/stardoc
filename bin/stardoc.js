#!/usr/bin/env node
'use strict';

var Liftoff = require('liftoff');
var path = require('path');
var stardoc = require('../lib/main');

var cli = new Liftoff({
  name: 'stardoc',
  configName: 'stardoc',
});

cli.launch(handleArguments);

function handleArguments(env) {
  // console.log('LIFTOFF SETTINGS:', this);
  // console.log('CLI OPTIONS:', env.argv);
  // console.log('CWD:', env.cwd);
  // console.log('LOCAL MODULES PRELOADED:', env.preload);
  // console.log('EXTENSIONS RECOGNIZED:', env.validExtensions);
  // console.log('SEARCHING FOR:', env.configNameRegex);
  // console.log('FOUND CONFIG AT:', env.configPath);
  // console.log('CONFIG BASE DIR:', env.configBase);
  // console.log('YOUR LOCAL MODULE IS LOCATED:', env.modulePath);
  // console.log('LOCAL PACKAGE.JSON:', env.modulePackage);
  // console.log('CLI PACKAGE.JSON', require('../package'));

  // Read the stardoc config file.
  var data = require(env.configPath);

  // TODO: Warn if anything is missing.
  var styleFolder = path.normalize(data.styleFolder);
  var markupFolder = path.normalize(data.markupFolder);
  var outputFolder = path.normalize(data.outputFolder);
  var templateFolder = path.normalize(data.templateFolder);
  var styleIgnore = data.styleIgnore;

  stardoc.run({
    styleFolder: styleFolder,
    markupFolder: markupFolder,
    outputFolder: outputFolder,
    templateFolder: templateFolder,
    styleIgnore: styleIgnore
  });
}