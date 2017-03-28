'use strict';

/* global config */

const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();

const KeyCloak = require('keycloak-connect');
const keycloak = new KeyCloak({}, config.keycloak.keycloakConnectConfig);

app.use(logger('dev'));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.use(keycloak.middleware());

app.get('/foo', keycloak.protect(), (req, res) => {
    console.log(req);
    res.status(200).end('{ "message": "hello" }');
});

const http = require('http');
const server = http.createServer(app);

module.exports = server;



