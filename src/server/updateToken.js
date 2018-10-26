const jwt     = require('jsonwebtoken');
const fetch = require('node-fetch');
const oauthToken = require('./oauthToken');

async function updateToken(einsteinUrl, einsteinEmail, privateKey) {

  let argumentError;
  if (einsteinUrl == null) {
    argumentError = new Error('updateToken requires EINSTEIN_VISION_URL, the base API URL (first arg)');
    return Promise.reject(argumentError);
  }
  if (einsteinEmail == null) {
    argumentError = new Error('updateToken requires EINSTEIN_VISION_ACCOUNT_ID, the account ID (second arg)');
    return Promise.reject(argumentError);
  }
  if (privateKey == null) {
    argumentError = new Error('updateToken requires EINSTEIN_VISION_PRIVATE_KEY, the private key (third arg)');
    return Promise.reject(argumentError);
  }

  var reqUrl = `${einsteinUrl}/v1/oauth2/token`;

  var rsa_payload = {
    "sub": einsteinEmail,
    "aud": reqUrl
  }

  var rsa_options = {
    header:{
      "alg":"RS256",
      "typ":"JWT"
     },
     expiresIn: '1d'
  }

  var token = jwt.sign(
    rsa_payload,
    privateKey,
    rsa_options
  );

  var options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'accept': 'application/json'
    },
    body:'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion='+encodeURIComponent(token)
  }

  const granted = await fetch(reqUrl, options)
                    .then((response) => response.json())
                    .catch((error) => console.log(error));

  const accessToken = granted.access_token;
  oauthToken.set(accessToken);
  return accessToken
}

module.exports = updateToken;
