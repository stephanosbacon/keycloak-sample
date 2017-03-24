const config = require(process.cwd() + '/config')('testClient');
const include = config.include;

const kc = include('kcUtils.js');

module.exports = function(username, password, realm, callback) {

  letTokenStuff;

  after(function(done) {
    callback(tokenStuff);
    done();
  });


  it('getToken', function(done) {
    kc.getToken(username, password, realm, 'admin-cli')
      .then((body) => {
        tokenStuff = body;
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
}
