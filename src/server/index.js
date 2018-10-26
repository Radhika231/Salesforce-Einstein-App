import server from './web.server';
import 'babel-polyfill';

const fs = require("fs");
const updateToken = require('./updateToken');
const modelId = process.env.CUSTOM_MODEL_ID;
const einsteinUrl = process.env.EINSTEIN_VISION_URL;
const accountId  = process.env.EINSTEIN_VISION_ACCOUNT_ID;
const privateKey = fs.readFileSync('./src/server/einstein_platform.pem','utf8');

let webserver = new server()

updateToken(einsteinUrl, accountId, privateKey)
.then(() => {
  webserver.start(() => {
    console.log('Webserver started!')
  })
})
.catch(error => {
  console.log(`Failed to start server: ${error.stack}`);
  process.exit(1);
});
