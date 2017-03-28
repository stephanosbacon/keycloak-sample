'use strict';

/* global config absPath include */

const fs = require('fs');
const normalizePort = include('config/normalizePort');

const protocol = (process.env.KCTEST_SERVICE_PROTOCOL || 'http');
const servicePort = normalizePort(process.env.KCTEST_SERVICE_PORT || '3000');

const certsPath = (process.env.CERTS_PATH);
const httpOptions = protocol === 'https' ? {
  key: fs.readFileSync(certsPath + '/server.key'),
  cert: fs.readFileSync(certsPath + '/server.crt')
} : null;


const  kcServiceHost = (process.env.KEYCLOAK_SERVICE_HOST || 'localhost');
const kcServicePort =  (process.env.KEYCLOAK_SERVICE_PORT || '8080');
const kcServiceProtocol = (process.env.KEYCLOACK_SERVICE_PROTOCOL || 'http');
const keycloakDotJsonPath = (process.env.KEYCLOAK_JSON || absPath('temp/keycloak.json'));

module.exports = {
  'protocol': protocol,
  'httpOptions': httpOptions,
  'servicePort': servicePort,

  keycloak: {
    'serviceHost' : kcServiceHost,
    'servicePort' :  kcServicePort,
    'serviceProtocol': kcServiceProtocol,
    'serviceUrl': kcServiceProtocol + '://' + kcServiceHost + ':' + kcServicePort + '/auth',
    'keycloakConnectConfig': fs.readFileSync(keycloakDotJsonPath)
  }
};

