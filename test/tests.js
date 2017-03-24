'use strict';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

config = require(process.cwd() + '/config')('testClient');
include = config.include;

include('test/kcUtil/kcUtilTests.js');
