'use strict';

const config = require(process.cwd() + '/config')('testClient');
const include = config.include;

const kc = include('kcUtils.js');

const assert = require('assert');
const gensym = require('randomstring');

const cs = {
  length: 10,
  capitalization: 'lowercase'
};

describe('Test kcUtils', function() {
  let tokenStuff;
  let userInfo;
  let idOfClient;
  let clientId = gensym.generate(cs);
  let clientSecret;

  let createdUserId;

  after(function(done) {
    kc.deleteClient(tokenStuff.access_token, config.initialRealm, idOfClient)
      .then(() => {
        return kc.deleteUser(tokenStuff.access_token, config.initialRealm, createdUserId);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('get token', function(done) {
    kc.getToken(config.initialUsername, config.initialPassword, config.initialRealm,
                config.initialClient)
      .then((body) => {
        tokenStuff = body;
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('createClient', function(done) {
    kc.createClient(tokenStuff.access_token, config.initialRealm,
                    {
                      // If this is false you need a client secret to do things like
                      // hit the userinfo endpoint
                      publicClient: false,
                      bearerOnly: true,
                      
                      // If this is false, you can't log in using this client
                      directAccessGrantsEnabled: true,
                      clientId: clientId
                    })
      .then((body) => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('getClients', function(done) {
    kc.getClients(tokenStuff.access_token, config.initialRealm,
                  {
                    clientId: clientId
                  })
      .then((body) => {
        idOfClient = body[0].id;
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('getClientSecret', function(done) {
    kc.getClientSecret(tokenStuff.access_token, config.initialRealm, idOfClient)
      .then(body => {
        clientSecret = body.value;
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('validateToken', function(done) {
    kc.validateToken(tokenStuff.access_token, config.initialRealm, clientId, clientSecret)
      .then(body => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('getUserInfo0', function(done) {
    kc.getUserInfo(clientSecret, tokenStuff.access_token, config.initialRealm)
      .then(ui => {
        done();
      })
      .catch(err => {
        done(err);
      });
    
  });

  it('getUser - for initial user', function(done) {
    kc.getUser(tokenStuff.access_token, config.initialRealm, config.initialUsername)
      .then(body => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  let userData = {
    email: gensym.generate(cs) + '@foobar.com',
    firstName: gensym.generate(cs),
    lastName: gensym.generate(cs),
    username: gensym.generate(cs),
    enabled: true,
    credentials: [{
      type: 'password',
      value: 'flubbidy',
      temporary: false
    }]
  };

  /*
  let userData = {
    email: 'foob@foobar.com',
    firstName: 'foob',
    lastName: 'bar',
    username: 'foob',
    enabled: true,
    credentials: [{
      type: 'password',
      value: 'flee',
      temporary: false
    }]
  };
*/

  it('createUser', function(done) {
    kc.createUser(tokenStuff.access_token, config.initialRealm, userData)
      .then(() => {
        return kc.getUser(tokenStuff.access_token, config.initialRealm,
                          userData.username);
      })
      .then((users) => {
        createdUserId = users[0].id;
        return kc.resetPassword(tokenStuff.access_token, config.initialRealm,
                                users[0].id, userData.credentials[0].value);
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('getToken and getUserInfo - for new user', function(done) {
    // Note that the client that we created in this test is confidential so we cannot
    // get a token using it, so we use the original client to get the token.
    //
    kc.getToken(userData.username, userData.credentials[0].value,
                config.initialRealm, config.initialClient)
      .then(ts => {
        // But getUserInfo using the newly created client works
        return kc.getUserInfo(clientSecret, ts.access_token, config.initialRealm);
      })
      .then((foo) => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

});




