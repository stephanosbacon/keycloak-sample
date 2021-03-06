'use strict'

/* global config describe before after it */

const config = require(process.cwd() + '/config')('testClient');
const include = config.include;
const absPath = config.absPath;

const request = require('supertest');
const assert = require('assert');
const req = request(config.serverUrl);

const fs = require('fs');

const kc = include('index.js')(config.keycloak.serviceUrl);
const gensym = require('randomstring').generate;

const cs = {
  length: 10,
  capitalization: 'lowercase'
};

function gensymUsers(numberToCreate) {
  let users = [];
  for (let x = 0; x < numberToCreate; x++) {
    users.push({
      'email': gensym(cs) + '@gmail.com',
      'firstName': gensym(cs),
      'lastName': gensym(cs),
      'username': gensym(cs),
      enabled: true,
      credentials: [{
        type: 'password',
        value: 'flubbidy',
        temporary: false
      }]
    });
  }
  return users;
}

describe('Test using keycloak-connect', function() {

  let tokenStuff;
  let users = gensymUsers(4);
  let clientId = gensym(cs);
  let idOfClient;
  let clientSecret;
  let realmPublicKey;

  let server;

  // First set up the keycloak client for the server to use along with users
  before(function(done) {
    kc.getToken(config.initialUsername, config.initialPassword, config.initialRealm,
                config.initialClient, body => { return body.access_token; })
      .then(accessToken => {
        // Having gotten an access token, create the client and get a bunch of
        // info that we'll need later.
        return kc.createClient(accessToken, config.initialRealm,
                               {
                                 publicClient: false,
                                 bearerOnly: true,
                                 directAccessGrantsEnabled: false,
                                 clientId: clientId
                               })
          .then(() => {
            // Get the idOfClient (as opposed to the clientId)
            return kc.getClient(accessToken, config.initialRealm, clientId,
                                client => { idOfClient = client.id; return client.id; }); })
          .then((id) => {
            // Grab the client secret (don't need it for demo, just an example)
            return kc.getClientSecret(accessToken, config.initialRealm, id,
                                      (body) => { clientSecret = body.value; return {}; }); })
          .then(() => {
            // Get the realm public key (we don't need it for the demo, just an example
            return kc.getRealmKeys(accessToken, config.initialRealm,
                                   rval => {
                                     return rval.keys.find(elt => {
                                       return elt.type === 'RSA'; });
                                   }); })
          .then(key => { realmPublicKey = key.publicKey; return {}; })
          .then(() => {
            // Create the users
            return Promise.all(users.map(user => {
              return kc.createUser(accessToken, config.initialRealm, user)
                .then(() => {
                  return kc.getUser(accessToken, config.initialRealm,
                                    user.username); })
                .then((createdUser) => {
                  return kc.resetPassword(accessToken, config.initialRealm,
                                          createdUser.id, user.credentials[0].value); });
            }));
          });
      })
      .then(() => done())
      .catch(err => done(err));
  });

  // Then generate the keycloak.json file
  before(function(done) {
    // We will be using the newly generated client which is a bearer-only client
    // The following aren't needed for this case, but if you wanted to use
    // keycloak-auth-utils directly, and do things like validateToken you'd need
    // to pass in the credentials piece at least.
    //
    //      'realm-public-key': realmPublicKey,
    //      credentials: {
    //        secret: clientSecret
    //      }
    let keycloakJson = {
      realm: config.initialRealm,
      'bearer-only': true,  // Note bearer-only vs bearerOnly in createClient
      'auth-server-url': config.keycloak.serviceUrl,
      'ssl-required': "external",
      resource: clientId
    };      

    if (!fs.existsSync(absPath('temp'))) {
      fs.mkdirSync(absPath('temp'));
    }
    let str = JSON.stringify(keycloakJson);
    fs.writeFileSync(absPath('temp/keycloak.json'), JSON.stringify(keycloakJson, null, 2));
    done();
  });

  // Now start up the server
  before(function() {
    // Now that we have keycloak.json file, let's set it in the config
    config.keycloak.keycloakConnectConfig = fs.readFileSync(absPath('temp/keycloak.json'));

    server = include('test/util/server.js');
    server.listen(config.servicePort);
  });

  let userAccessToken;

  // Get a token as one of the newly created users
  it('login', function (done) {
    kc.getToken(users[0].username, users[0].credentials[0].value,
                config.initialRealm, config.initialClient)
      .then(tok => { userAccessToken = tok.access_token; done(); })
      .catch(err => done(err));
  });

  // And this is what all the fuss was about
  //
  it('now test a route', function(done) {
    req.get('/foo')
       .set('Authorization', 'Bearer ' + userAccessToken)
       .expect(200)
       .end(function (err, res) {
         assert.equal(res.body.message, 'hello');
         done(err);
       });
  });
    
});








