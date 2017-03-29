'use strict';

var fs = require('fs');

let config = include('config/config-dev.js');

const serviceHost = (process.env.KCTEST_SERVICE_HOST || 'localhost');

config.initialUsername = (process.env.TEST_INITIAL_KC_USERNAME || 'foo');
config.initialPassword = (process.env.TEST_INITIAL_KC_PASSWORD || 'bar');
config.initialRealm = (process.env.TEST_KC_REALM || 'master');
config.initialClient = (process.env.TEST_KC_CLIENT || 'admin-cli');


config.serverUrl =
  config.protocol + '://' + serviceHost + ':' + config.servicePort;

module.exports = config;
