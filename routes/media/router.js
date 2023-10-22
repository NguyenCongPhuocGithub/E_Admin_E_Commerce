var express = require('express');
var router = express.Router();

const { uploadSingle } = require('./controller');

router.route('/upload-single/:id')
  .post(uploadSingle);

module.exports = router;
