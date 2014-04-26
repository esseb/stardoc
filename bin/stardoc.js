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

  stardoc.run({
    styleFolder: styleFolder,
    markupFolder: markupFolder,
    outputFolder: outputFolder,
    templateFolder: templateFolder,
    styleIgnore: styleIgnore
  });

  // TODO: Call publish() when styleObjects is ready.
  var template = require(templateFolder + '/publish.js');
  template.publish({});
}