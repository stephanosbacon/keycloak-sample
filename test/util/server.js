'use strict';

/* global config */

const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();

const KeyCloak = require('keycloak-connect');
const keycloak = new KeyCloak({}, config.keycloak.keycloakDotJsonPath);

app.use(logger('dev'));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.use(keycloak.middleware());

app.get('/foo', keycloak.protect(), (req, res) => {
  // If you want to get at the user info inside the token
  // look in req.kauth.grant.access_token.content
  // The id-of-user is the field "sub"
  // console.log(JSON.stringify(req.kauth.grant.access_token.content, null, 2));
  res.status(200).send({ message: 'hello' }).end();
});

const http = require('http');
const server = http.createServer(app);

module.exports = server;



