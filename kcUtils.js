const request = require('request');

function getToken(username, password, realm, clientId) {
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
  }

  return req(options);
}


/* 
 clientData example:
 { "clientId": "testclient",
   "bearerOnly": true
   }
 }
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
  }
  return req(options);
}

function getClients(accessToken, realm, qs) {
  let options = {
    method: 'GET',
    url: consUrl('/admin/realms/' + realm + '/clients'),
    headers: {
      authorization: 'Bearer ' + accessToken
    },
    qs: qs
  }
  return req(options);
}

function deleteClient(accessToken, realm, idOfClient) {
  let options = {
    method: 'DELETE',
    url: consUrl('/admin/realms/' + realm + '/clients/' + idOfClient),
    headers: {
      authorization: 'Bearer ' + accessToken
    }
  }
  return req(options);
}

function getClientSecret(accessToken, realm, idOfClient) {
  let options = {
    method: 'GET',
    url: consUrl('/admin/realms/' + realm + '/clients/' + idOfClient + '/client-secret'),
    headers: {
      authorization: 'Bearer ' + accessToken
    }
  }
  return req(options);
}

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
   Note that in order to actually create a user that you can then get a token for,
it seems like you have to (a) create a user (b) reset the user's password (even if you pass 
credentials for the creat).

In order to reset the user's password, you then have to fetch the user (calling getUser)


  userData example:
  {
    "email" : "foo@bar.com",
    "firstName" :  "foo",
    "lastName" : "bar"
    "username" : "foo",
   "credentials" : [{
      "type" : "password",
      "value" : "flubbidy",
      "temporary" : false
    }]
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

function resetPassword(accessToken, realm, username, newPass) {
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
      temporary: false
    })
  };
  return req(options);
}

function getUserInfo(clientSecret, accessToken, realm) {
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
  return req(options);
}

function getUser(accessToken, realm, userName) {
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
  return req(options);
}

// Note that the third arg is an id, not a username, so you either have to call
// getUser or getUserInfo or validateToken if you have a token from that user
// in order to get it.  In the case of validate token, the user's id is actually
// in the "sub" field
//
function deleteUser(accessToken, realm, userId) {
  let options = {
    method: 'GET',
    url: consUrl('/admin/realms/' + realm + '/users/' + userId),
    headers: {
      authorization: 'Bearer ' + accessToken,
      'content-type': 'application/x-www-form-urlencoded'
    }
  };
  return req(options);
}

function req(options) {
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) {
        console.log(error);
        reject(error);
      } else if (response.statusCode < 200 || response.statusCode > 299) {
        console.log(body);
        reject (new Error('statusCode: ' + response.statusCode));
      } else {
        resolve(body.length === 0 ? {} : JSON.parse(body));
      }
    });
  });
}

function consUrl(resource) {
  let rval = config.keycloakUrl + resource;
  return rval;
}
  


module.exports.getToken = getToken;
module.exports.createClient = createClient;
module.exports.creatUser = createUser;
module.exports.deleteUser = deleteUser;
module.exports.getUserInfo = getUserInfo;
module.exports.getClients = getClients;
module.exports.deleteClient = deleteClient;
module.exports.getClientSecret = getClientSecret;
module.exports.validateToken = validateToken;
module.exports.createUser = createUser;
module.exports.getUser = getUser;
module.exports.resetPassword = resetPassword;
