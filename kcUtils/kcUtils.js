/**
 * @fileOverview Utility functions for accessing keycloak's REST API.  Relies on a global
 *   called 'config.keycloak.serviceUrl' being set to .e.g. http://localhost:8080/auth
 * @name kcUtils.js
 * @author 
 * @license 
 */

'use strict';

const request = require('request');

/**
 * Invokes the '/realms/{realm}/protocol/openid-connect/token' endpoint

 * @param {string} username
 * @param {string} password
 * @param {string} realm
 * @param {string} clientId - the name of the client to use
 * @param {string} cleaner - a cleaner function (takes a body and returns something)
 * @returns {Promise} returns a promise, that when resolves returns the following schema:
 * {
 *    "access_token": "...",
 *    "expires_in": <seconds>,
 *    "refresh_expires_in": <seconds>
 *    "refresh_token": "..."
 *    "token_type": "bearer",
 *    "id_token": "... " (this is the refresh token
 *    "not-before-policy": 0,
 *    "session_state": "..."
 * }
 */
function getToken(username, password, realm, clientId, cleaner) {
  let options = {
    method: 'POST',
    url: consUrl('/realms/' + realm + '/protocol/openid-connect/token'),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      grant_type: 'password',
      username: username,
      password: password,
      client_id: clientId
    }
  };

  return req(options, cleaner);
}


/**
 * 
 * @param {string} accessToken
 * @param {string} realm
 * @param {Object} clientData for example:
 *                  { "clientId": "testclient",
 *                    "bearerOnly": true
 *                  }
 * @returns {Promise} a promise
 */
function createClient(accessToken, realm, clientData) {
  let options = {
    method: 'POST',
    url: consUrl('/admin/realms/' + realm + '/clients'),
    headers: {
      authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(clientData)
  };
  return req(options);
}

/**
 * 
 * @param {string} accessToken
 * @param {string} realm
 * @param {string} clientId
 * @param {string} cleaner - optional cleaner function
 * @returns {Promise} a promise that when resolved returns an instance of
 *          http://www.keycloak.org/docs-api/3.0/rest-api/index.html#_clientrepresentation
 */
function getClient(accessToken, realm, clientId, cleaner) {
  let options = {
    method: 'GET',
    url: consUrl('/admin/realms/' + realm + '/clients'),
    headers: {
      authorization: 'Bearer ' + accessToken
    },
    qs: {
      clientId: clientId
    }
  };
  return req(options, body => { return cleaner ? cleaner(body[0]) : body[0]; } );
}

/**
 * Invokes the '/admin/realms/{realm}/clients/{idOfClient}' endpoint
 *
 * @param {string} accessToken
 * @param {string} realm
 * @param {string} idOfClient - this is the id (not the clientId, aka name).  
 *                              You get this by using getClient()[0].id
 * @returns {Promise} - a promise
 */
function deleteClient(accessToken, realm, idOfClient) {
  let options = {
    method: 'DELETE',
    url: consUrl('/admin/realms/' + realm + '/clients/' + idOfClient),
    headers: {
      authorization: 'Bearer ' + accessToken
    }
  };
  return req(options);
}

/**
 * Invokes the '/admin/realms/{realm}/clients/{idOfClient}/client-secret' endpoint.
 *
 * @param {string} accessToken
 * @param {string} realm
 * @param {string} idOfClient - this is the id (not the licentId, aka name).
 *                              You get this by using getClient().id
 * @returns {Promise} - a promise, that when resolved returns an instance of
 *  http://www.keycloak.org/docs-api/3.0/rest-api/index.html#_credentialrepresentation,
 *  from which you want the "value" attribute.
 */
function getClientSecret(accessToken, realm, idOfClient, cleaner) {
  let options = {
    method: 'GET',
    url: consUrl('/admin/realms/' + realm + '/clients/' + idOfClient + '/client-secret'),
    headers: {
      authorization: 'Bearer ' + accessToken
    }
  };
  return req(options, cleaner);
}

/**
 * Invokes the '/admin/realms/{realm}/keys' endpoint
 * @param {string} accessToken
 * @param {string} realm
 * @param {Function} cleaner - optional function to retrieve a subset of the returned keys
 *           called on the document returned by the endpoint before it resolves the promise
 * @returns {Promise} - a promise, that when resolved yeilds a
 * http://www.keycloak.org/docs-api/3.0/rest-api/index.html#_keysmetadatarepresentation
 *  sample:
 * { active: 
 *   { RSA: '_hkNwDhLU4gjxUBGQfq5wYSTm4CfbA5148RJdKdtFLQ',
 *     HMAC: '66ca66aa-9a17-4616-8326-96b358a25e3e' },
 *  keys: 
 *   [ { providerId: '7c5e99db-e18f-4114-bacb-e057daa98ca9',
 *       providerPriority: 100,
 *       kid: '_hkNwDhLU4gjxUBGQfq5wYSTm4CfbA5148RJdKdtFLQ',
 *       status: 'ACTIVE',
 *       type: 'RSA',
 *       publicKey: '....',
 *       certificate: '...'
 *     }
 *     { providerId: '1936d016-7dbe-4f88-9867-719dbc7fceca',
 *       providerPriority: 100,
 *       kid: '66ca66aa-9a17-4616-8326-96b358a25e3e',
 *       status: 'ACTIVE',
 *       type: 'HMAC' } ] }
 *
 */
function getRealmKeys(accessToken, realm, cleaner) {
  let options = {
    method: 'GET',
    url: consUrl('/admin/realms/' + realm + '/keys'),
    headers: {
      authorization: 'Bearer ' + accessToken
    }
  };
  return req(options, cleaner);
}

/**
 * Invokes the '/realms/{realm}/protocol/openid-connect/token/introspect' endpoint,
 * @param {string} tokenToValidate
 * @param {string} realm
 * @param {string} clientId
 * @param {string} clientSecret - from a call to getSecrets
 * @returns {Promise} - a promise, which when resolved yields an object that contains
 * a couple of useful fields:  "active" and "sub" where the former is true if the 
 * token is active. If it is it, the "sub" field is the idOfUser for the user.
 * 
 */
function validateToken(tokenToValidate, realm, clientId, clientSecret) {
  let auth = new Buffer(clientId + ':' + clientSecret).toString('base64');
  let options = {
    method: 'POST',
    url: consUrl('/realms/' + realm + '/protocol/openid-connect/token/introspect'),
    headers: {
      authorization: 'Basic ' + auth,
      'content-type': 'application/x-www-form-urlencoded'
    },
    form: {
      token: tokenToValidate
    }
  };

  return req(options);
}

/**
 * Create a user invoking the '/admin/realms/{realm}/users' endoint.
 *  Note that in order to actually create a user that you can then get a token for,
 *  it seems like you have to (a) create a user (b) reset the user's password (even if 
 *  you pass credentials for the create).
 *
 *  In order to reset the user's password, you then have to fetch the user (calling getUser)
 *  and then call resetPassword()
 *
 * @param {string} accessToken
 * @param {string} realm
 * @param {Object} userData - an instance of
 *  http://www.keycloak.org/docs-api/3.0/rest-api/index.html#_userrepresentation
 *
 *  userData example:
 *  {
 *    "email" : "foo@bar.com",
 *    "firstName" :  "foo",
 *    "lastName" : "bar"
 *    "username" : "foo",
 *    "credentials" : [{
 *      "type" : "password",
 *      "value" : "flubbidy",
 *      "temporary" : false
 *    }]
 *  }
 * @returns {Promise} - a promise.
 */
function createUser(accessToken, realm, userData) {
  let options = {
    method: 'POST',
    url: consUrl('/admin/realms/' + realm + '/users'),
    headers: {
      authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  };
  return req(options);
}

/**
 * Reset a user's password by posting to the 
 * '/admin/realms/{realm}/users/username/reset-password' endpoint.
 * @param {} accessToken
 * @param {} realm
 * @param {} username
 * @param {} newPass
 * @returns {} 
 */
function resetPassword(accessToken, realm, username, newPass, temporary) {
  if (temporary === null) {
    temporary = false;
  }
  
  let options = {
    method: 'PUT',
    url: consUrl('/admin/realms/' + realm + '/users/' + username + '/reset-password'),
    headers: {
      authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'password',
      value: newPass,
      temporary: temporary
    })
  };
  return req(options);
}

/**
 * Get user profile info for the user associated with the access token if the token
 * is still valid.
 * @param {string} clientSecret
 * @param {string} accessToken
 * @param {string} realm
 * @returns {Promise} a promise which when resolved yields a user info object that includes
 *   among other fields "sub" (which is the idOfUser) as well as name, email, etc.
 */
function getUserInfo(clientSecret, accessToken, realm, cleaner) {
  let options = {
    method: 'GET',
    url: consUrl('/realms/' + realm + '/protocol/openid-connect/userinfo'),
    headers: {
      authorization: 'Bearer ' + accessToken,
      'content-type': 'application/x-www-form-urlencoded'
    },
    qs: {
      client_secret: clientSecret
    }
  };
  return req(options, cleaner);
}

/**
 * Retrieve a user representation
 * @param {string} accessToken
 * @param {string} realm
 * @param {string} userName
 * @returns {Promise} a promise, which when resolved yields an instance of
 *   http://www.keycloak.org/docs-api/3.0/rest-api/index.html#_userrepresentation
 */
function getUser(accessToken, realm, userName, cleaner) {
  let options = {
    method: 'GET',
    url: consUrl('/admin/realms/' + realm + '/users'),
    headers: {
      authorization: 'Bearer ' + accessToken,
      'content-type': 'application/x-www-form-urlencoded'
    },
    qs: {
      username: userName
    }
  };
  return req(options, body => { return cleaner ? cleaner(body[0]) : body[0]; } );
}

// Note that the third arg is an id, not a username, so you either have to call
// getUser or getUserInfo or validateToken if you have a token from that user
// in order to get it.  In the case of validate token, the user's id is actually
// in the "sub" field
//
/**
 * Delete the user with the given id (not name!)
 * @param {string} accessToken
 * @param {string} realm
 * @param {string} userId - to get this, you have to call validateToken()/getUserInfo()
 *   and use the "sub" field, or call getUser() and use the id field.
 * @returns {} 
 */
function deleteUser(accessToken, realm, idOfUser) {
  let options = {
    method: 'GET',
    url: consUrl('/admin/realms/' + realm + '/users/' + idOfUser),
    headers: {
      authorization: 'Bearer ' + accessToken,
      'content-type': 'application/x-www-form-urlencoded'
    }
  };
  return req(options);
}


/**
 * 
 * @param {Object} options - for the request
 * @returns {Promise} 
 */
function req(options, bodyCleaner) {
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else if (response.statusCode < 200 || response.statusCode > 299) {
        reject (new Error('statusCode: ' + response.statusCode + ' op: '
                          + options.method + ':' + options.url));
      } else {
        if (body.length === 0) {
          resolve({});
        } else {
          let bod = JSON.parse(body);
          resolve(bodyCleaner? bodyCleaner(bod) : bod);
        }
      }
    });
  });
}

/**
 * 
 * @param {string} resource
 * @returns {} 
 */
function consUrl(resource) {
  let rval = config.keycloak.serviceUrl + resource;
  return rval;
}
  


module.exports.getToken = getToken;
module.exports.createClient = createClient;
module.exports.creatUser = createUser;
module.exports.deleteUser = deleteUser;
module.exports.getUserInfo = getUserInfo;
module.exports.getClient = getClient;
module.exports.getRealmKeys = getRealmKeys;
module.exports.deleteClient = deleteClient;
module.exports.getClientSecret = getClientSecret;
module.exports.validateToken = validateToken;
module.exports.createUser = createUser;
module.exports.getUser = getUser;
module.exports.resetPassword = resetPassword;
