'use strict';

const fs = require('fs');
const normalizePort = include('config/normalizePort');

const protocol = process.env.PROTOCOL || 'http';
const keycloakServer = (process.env.KEYCLOAK_SERVICE_HOST || 'localhost')
const keycloakPort = (process.env.KEYCLOAK_SERVICE_PORT || '8080');

const certsPath = (process.env.CERTS_PATH);

const httpOptions = protocol === 'https' ? {
  key: fs.readFileSync(certsPath + '/server.key'),
  cert: fs.readFileSync(certsPath + '/server.crt')
} : null;

module.exports = {
  'protocol': protocol,
  'httpOptions': httpOptions,
  'keycloakServer' : keycloakServer,
  'keycloakPort' : keycloakPort,
  'keycloakUrl' : protocol + '://'
    + keycloakServer + ':' + keycloakPort + '/auth'
};

