const router = require('express').Router();
const { imageClassifierController } = require('../controllers');

router.post('/', imageClassifierController.predict);

module.exports = router;
