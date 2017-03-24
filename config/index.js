'use strict';

/**
 * configType - dev, testClient, prod - there should be a file in '.'
 * called config-<configType>.js
 * The config files assume that they have access to the global functions
 * abs_path and include defined herein.
 */
function config(configType) {

  let baseDir = process.cwd();

  global.absPath = function (path) {
    return baseDir + '/' + path;
  };

  global.include = function (file) {
    return require(global.absPath(file));
  };

  /**
   * Normalize a port into a number, string, or false.
   */

  global.config = include('config/config-' + configType + '.js');
  global.config.include = global.include;
  global.config.absPath = global.absPath;

  return global.config;
}

module.exports = config;
