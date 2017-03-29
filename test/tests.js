'use strict';

const config = require(process.cwd() + '/config')('testClient');
const include = config.include;

// First, test the kcUtils.js functions themselves
//
include('test/kcUtil/kcUtilTests.js');


// Now use the functions to set up a client, some users, etc. and test using
// keycloak-connect on a trivial rest service.
//
include('test/demo/testUsingUtils.js');
