const express = require('express');
const router = express.Router();
const wordCloudController = require('../controllers/wordCloud.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');

router.post('/sessions', authMiddleware, wordCloudController.createSession);
router.get('/sessions/my', optionalAuthMiddleware, wordCloudController.getMySessions);
router.get('/sessions/:id', wordCloudController.getSession); // Public read access for participants

module.exports = router;
