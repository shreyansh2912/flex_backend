const express = require('express');
const router = express.Router();
const formDataController = require('../controllers/formdata.controller');

router.post('/', formDataController.createFormData);

module.exports = router;
