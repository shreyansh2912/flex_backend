const express = require('express');
const router = express.Router();
const pollController = require('../controllers/poll.controller');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');

router.get('/', optionalAuthMiddleware, pollController.getPolls);

module.exports = router;
