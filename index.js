#! /usr/local/bin/node

'use strict';

const request = require('request');
const jwt = require('jsonwebtoken');

function getUsers(accessToken) {
    return new Promise((resolve, reject) => {
	let getUsersOptions = {
	    method: 'GET',
	    url: 'http://localhost:8080/auth/admin/realms/master/users',
	    headers: {
		authorization: 'Bearer ' + accessToken
	    }
	};

	request(getUsersOptions, (error, response, body) => {
	    if (error) reject(error);
	    else resolve(JSON.parse(body));
	});
    });
}

function getKeys(accessToken) {
    return new Promise((resolve, reject) => {
	let getKeysOptions = { method: 'GET',
		    url: 'http://localhost:8080/auth/admin/realms/master/keys',
		    headers: {
			authorization: 'Bearer ' + accessToken
		    }
		  };

	request(getKeysOptions, (error, response, body) => {
	    if (error) {
                reject(error)
            } else {
                resolve(response.body);
            }
	});
    });
}

function getClients(accessToken) {
    return new Promise((resolve, reject) => {
	let options = {
            method: 'GET',
	    url: 'http://localhost:8080/auth/admin/realms/master/clients?clientId=admin-cli',
	    headers: {
	        'authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/x-www-form-urlencoded'
	    }
	};

	request(options, (error, response, body) => {
	    if (error) {
                reject(error)
            } else {
                console.log('statusCode: ' + response.statusCode);
                if (response.statusCode < 400) {
                    console.log(body);
                    resolve(JSON.parse(body));
                }
            }
	});
    });
}


function getClientSecret(accessToken) {
    return new Promise((resolve, reject) => {
	let options = {
            method: 'GET',
	    url: 'http://localhost:8080/auth/admin/realms/master/clients/27f4be83-a3f6-41b8-adf8-05197158e854/client-secret',
	    headers: {
	        'authorization': 'Bearer ' + accessToken
	    }
	};

	request(options, (error, response, body) => {
	    if (error) {
                reject(error)
            } else {
                console.log('statusCode: ' + response.statusCode);
                if (response.statusCode < 400) {
                    console.log(body);
                    resolve(JSON.parse(body));
                }
            }
	});
    });
}


function validateToken(accessToken, accessToken1) {
    return new Promise((resolve, reject) => {
	let options = {
            method: 'POST',
	    url: 'http://localhost:8080/auth/realms/master/protocol/openid-connect/token/introspect',
	    headers: {
		authorization: 'Bearer ' + accessToken,
                'content-type': 'application/x-www-form-urlencoded'
	    },
            form: {
                token: accessToken1,
                token_type_hint: 'requesting_party_token',
            }
	};

	request(options, (error, response, body) => {
	    if (error) {
                reject(error)
            } else {
                console.log('statusCode: ' + response.statusCode);
                resolve(body);
            }
	});
    });
}


function userInfo(accessToken) {
    return new Promise((resolve, reject) => {
	let options = {
            method: 'GET',
	    url: 'http://localhost:8080/auth/realms/master/protocol/openid-connect/userinfo',
	    headers: {
		authorization: 'Bearer ' + accessToken,
                'content-type': 'application/x-www-form-urlencoded'
	    }
	};

	request(options, (error, response, body) => {
	    if (error) {
                reject(error)
            } else if (response.statusCode != 200) {
                reject({ statusCode: 200 });
            } else {
                resolve(JSON.parse(body).sub);
            }
	});
    });
}

function wellKnown(accessToken) {
    return new Promise((resolve, reject) => {
	let options = {
            method: 'GET',
	    url: 'http://localhost:8080/auth/realms/master/.well-known/openid-configuration',
	    headers: {
		authorization: 'Bearer ' + accessToken
	    }
	};

	request(options, (error, response, body) => {
	    if (error) {
                reject(error)
            } else {
                console.log('statusCode: ' + response.statusCode);
                resolve(body);
            }
	});
    });
}

var loginOptions = {
    method: 'POST',
    url: 'http://localhost:8080/auth/realms/master/protocol/openid-connect/token',
    headers: {
        'content-type': 'application/x-www-form-urlencoded'
    },
    form: {
        grant_type: 'password',
        username: 'foo',
        password: 'bar',
        client_id: 'testclient'
    }
};

var loginOptions1 = {
    method: 'POST',
    url: 'http://localhost:8080/auth/realms/master/protocol/openid-connect/token',
    headers: {
        'content-type': 'application/x-www-form-urlencoded'
    },
    form: {
        grant_type: 'password',
        username: 'jimbob',
        password: 'bar',
        client_id: 'testclient'
    }
};



function tryIt(accessToken) {
    return new Promise((resolve, reject) => {
	let options = {
            method: 'GET',
	    url: 'http://localhost:3001/foo',
	    headers: {
		authorization: 'Bearer ' + accessToken,
	    }
	};

	request(options, (error, response, body) => {
	    if (error) {
                reject(error)
            } else if (response.statusCode != 200) {
                reject({ statusCode: response.statusCode });
            } else {
                resolve(body);
            }
	});
    });
}

request(loginOptions, function (error, response, body) {
    if (error) throw new Error(error);
    let jsonBody = JSON.parse(body);
    let accessToken = jsonBody.access_token;

    tryIt(accessToken)
        .then((body) => {
            console.log(body)
          JSON.parse(body);
          })
        .catch((err) => { console.log(err); });
});


    /*
    request(loginOptions1, function(error1, response1, body1) {
        let jsonBody1 = JSON.parse(body1);
        let accessToken1 = jsonBody1.access_token;
        

        userInfo(accessToken)
	    .then((body) => {
                console.log('body: ' + body);
                console.log(jwt.decode(accessToken));
	    })
            .catch((err) => { console.log(err); });
    });
*/







