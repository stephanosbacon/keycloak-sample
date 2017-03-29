# keycloak-sample
Use of keycloak REST APIs to automate creation of clients, users, and so on, created initially to figure out how to automate test creation for express.js/keycloak-connect based services.

First off: use keycloak-connect, NOT connect-keycloak

This repo came about as a result of trying to figure out how to use keycloak for my little [chatbak](https://github.com/stephanosbacon/chatBack)
project.  What I wanted to do was to be able to automate the creation of users, clients, and so on, and I found that there weren't really
any good examples of doing so.

As a result I wrote a little utility module called [jsUtils.js](https://github.com/stephanosbacon/keycloak-sample/blob/master/kcUtils/kcUtils.js)
and used it to create a test setup.

In order to run this sample, after cloning the repo, say

```
docker run -e KEYCLOAK_USER=foo -e KEYCLOAK_PASSWORD=bar -p 8080:8080 jboss/keycloak
npm install
npm test
```
