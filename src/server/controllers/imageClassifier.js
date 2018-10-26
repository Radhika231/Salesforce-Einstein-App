const fetch = require('node-fetch');
const rp = require('request-promise');
const multiparty = require('multiparty');
const fs = require("fs");
const path = require("path");
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const updateToken = require('./../updateToken');
const oauthToken = require('./../oauthToken');
const modelId = process.env.CUSTOM_MODEL_ID;
const einsteinUrl = process.env.EINSTEIN_VISION_URL;
const accountId  = process.env.EINSTEIN_VISION_ACCOUNT_ID;
const privateKey = fs.readFileSync('./src/server/einstein_platform.pem','utf8');

let loopPreventor = false;

function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
}

async function imageClassifier(
    einsteinUrl,
    fileData,
    modelId,
    accountId,
    privateKey) {
      var token = oauthToken.get();

      var formData = {
        modelId: modelId,
        sampleBase64Content: fileData
      }

      var options = {
          url: `${einsteinUrl}/v1/vision/predict`,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            'Cache-Control': 'no-cache'
          },
          formData: formData,
          json: true
      }

      let { body, isUnauthorized } = await rp(options)
      .then( body => ({ body }))
      .catch(error => {
        if(error.statusCode === 401) {
         return { isUnauthorized: true };
        } else {
          throw error;
        }
      });

       if(!loopPreventor && isUnauthorized) {
         loopPreventor = true;
         let updatedToken = updateToken(einsteinUrl, einsteinEmail, privateKey);
         let predictions = await imageClassifier(
             einsteinUrl,
             fileData,
             modelId,
             accountId,
             privateKey);
         setTimeout(() => {loopPreventor=false}, 1000);
         return predictions;
       } else {
         return body;
       }
       return predictions;
}

async function getImagesForLabel(label) {
  const dirname = path.join(__dirname, `../src/server/shoppingImages/${label}/`);
  const filenames = await readdir(dirname);
  const files = await Promise.all(filenames.map(async (filename) => {
    return await readFile(dirname + filename, 'base64');
  }));
  return files.reduce((a, f) => a.concat(f), []);
}

module.exports = {
  predict(req, res) {
    const form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        throw new Error(err);
      }
      try {
        const { path } = files.file[0];
        const fileData = base64_encode(path);

        await imageClassifier(
            einsteinUrl,
            fileData,
            modelId,
            accountId,
            privateKey)
            .then(async(predictions) => {
              const bestPrediction = predictions.probabilities[0];
              const imagePaths = await getImagesForLabel(bestPrediction.label)
                .then((imagePaths) => res.status(200).send({ bestPrediction, imagePaths }))
            });
      }
      catch (error) {
        return res.status(400).send(error);
      }
    });
  }
}
