'use strict';

const config = require(process.cwd() + '/config')('dev');
const server = include('server.js');
server.listen(config.servicePort);







