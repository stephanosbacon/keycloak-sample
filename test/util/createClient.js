const config = require(process.cwd() + '/config')('testClient');
const include = config.include;

const kc = include('kcUtils.js');
const gensym = require('randomstring');

const cs = {
  length: 10,
  capitalization: 'lowercase'
};

module.exports = function(accessToken, realm, callback) {

  let rval {
    tokenStuff: {},
    clientSecret: {},
    clientId = gensym.generate(cs),
    idOfClient: {},
    realm = realm
  };

describe('Create client and test kcUtils', function() {

  after(function(done) {
    callback(rval);
    done();
  });

  it('createClient', function(done) {
    kc.createClient(accessToken, realm,
                    {
                      clientId: clientId,
                      bearerOnly: 'true'
                    })
      .then((body) => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('getClients', function(done) {
    kc.getClients(tokenStuff.access_token, realm,
                  {
                    clientId: clientId
                  })
      .then((body) => {
        rval.idOfClient = body[0].id;
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('getClientSecret', function(done) {
    kc.getClientSecret(tokenStuff.access_token, realm, idOfClient)
      .then(body => {
        rval.clientSecret = body.value;
        console.log(clientSecretStuff);
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('validateToken', function(done) {
    kc.validateToken(tokenStuff.access_token, realm, clientId, rval.clientSecret)
      .then(body => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });
});

}
