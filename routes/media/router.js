var express = require('express');
var router = express.Router();

const { uploadSingle, uploadMultiple } = require('./controller');

router.route('/upload-single')
  .post(uploadSingle);

router.route('/upload-multiple')
  .post(uploadMultiple);

module.exports = router;
