/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("node-fetch");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const jwt = __webpack_require__(13);
const fetch = __webpack_require__(1);
const oauthToken = __webpack_require__(4);

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
  };

  var rsa_options = {
    header: {
      "alg": "RS256",
      "typ": "JWT"
    },
    expiresIn: '1d'
  };

  var token = jwt.sign(rsa_payload, privateKey, rsa_options);

  var options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'accept': 'application/json'
    },
    body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + encodeURIComponent(token)
  };

  const granted = await fetch(reqUrl, options).then(response => response.json()).catch(error => console.log(error));

  const accessToken = granted.access_token;
  oauthToken.set(accessToken);
  return accessToken;
}

module.exports = updateToken;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var oauthToken = null;

function setToken(token) {
  oauthToken = token;
}

function getToken() {
  return oauthToken;
}

module.exports = {
  get: getToken,
  set: setToken
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _web = __webpack_require__(6);

var _web2 = _interopRequireDefault(_web);

__webpack_require__(14);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const fs = __webpack_require__(2);
const einsteinUrl = 'https://api.metamind.io';
const einsteinEmail = 'radhika.paryekar@colorado.edu';
const privateKey = fs.readFileSync('./src/server/einstein_platform.pem', 'utf8');
const updateToken = __webpack_require__(3);

let webserver = new _web2.default();

// Episode7.run(updateToken, einsteinUrl, einsteinEmail, privateKey)

updateToken(einsteinUrl, einsteinEmail, privateKey).then(() => {
  webserver.start(() => {
    console.log('Webserver started!');
  });
}).catch(error => {
  console.log(`Failed to start server: ${error.stack}`);
  process.exit(1);
});

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
let express = __webpack_require__(0);
const imageClassifierRouter = __webpack_require__(7);

class WebServer {
  constructor() {
    this.app = express();
    this.app.use(express.static('dist/public'));
    this.app.use('/file-upload', imageClassifierRouter);
  }

  start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(3000, function () {
          resolve();
        });
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

  stop() {
    return new Promise((resolve, reject) => {
      try {
        this.server.close(() => {
          resolve();
        });
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }
}
exports.default = WebServer;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const router = __webpack_require__(0).Router();
const { imageClassifierController } = __webpack_require__(8);

router.post('/', imageClassifierController.predict);

module.exports = router;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const imageClassifierController = __webpack_require__(9);

module.exports = {
  imageClassifierController
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const fetch = __webpack_require__(1);
const rp = __webpack_require__(10);
const multiparty = __webpack_require__(11);
const fs = __webpack_require__(2);
const path = __webpack_require__(12);
const updateToken = __webpack_require__(3);
const oauthToken = __webpack_require__(4);
const modelId = process.env.CUSTOM_MODEL_ID;
const einsteinUrl = process.env.EINSTEIN_VISION_URL;
const accountId = process.env.EINSTEIN_VISION_ACCOUNT_ID;
const privateKey = fs.readFileSync('./src/server/einstein_platform.pem', 'utf8');

let loopPreventor = false;

function base64_encode(file) {
  var bitmap = fs.readFileSync(file);
  return new Buffer(bitmap).toString('base64');
}

async function imageClassifier(einsteinUrl, fileData, modelId, einsteinEmail, privateKey) {
  var token = oauthToken.get();

  var formData = {
    modelId: modelId,
    sampleBase64Content: fileData
  };

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
  };

  let { body, isUnauthorized } = await rp(options).then(body => ({ body })).catch(error => {
    if (error.statusCode === 401) {
      return { isUnauthorized: true };
    } else {
      throw error;
    }
  });

  if (!loopPreventor && isUnauthorized) {
    loopPreventor = true;
    let updatedToken = updateToken(einsteinUrl, einsteinEmail, privateKey);
    let predictions = await imageClassifier(einsteinUrl, fileData, modelId, accountId, privateKey);
    setTimeout(() => {
      loopPreventor = false;
    }, 1000);
    return predictions;
  } else {
    return body;
  }
  return predictions;
}

function getImagesForLabel(label) {
  console.log(__dirname);
  const dirname = path.join(__dirname, `/shoppingImages/${label}/`);
  const imageResponses = [];
  fs.readdir(dirname, function (err, filenames) {
    if (err) {
      console.log("ERROR", err);
      return;
    }
    filenames.forEach(function (filename) {
      fs.readFile(dirname + filename, 'base64', function (err, content) {
        if (err) {
          console.log("ERROR", err);
          return;
        }
        imageResponses.append(content);
      });
    });
  });
  return imageResponses;
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

        await imageClassifier(einsteinUrl, fileData, modelId, accountId, privateKey).then(predictions => {
          const bestPrediction = predictions.probabilities[0];
          const imageResponses = getImagesForLabel(bestPrediction.label);
          res.status(200).send({ bestPrediction, imageResponses });
        });
      } catch (error) {
        return res.status(400).send(error);
      }
    });
  }
};

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("request-promise");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("multiparty");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("jsonwebtoken");

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("babel-polyfill");

/***/ })
/******/ ]);