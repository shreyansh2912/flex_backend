const express = require('express');
const router = express.Router();
const wordCloudController = require('../controllers/wordCloud.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/sessions', authMiddleware, wordCloudController.createSession);
router.get('/sessions/my', authMiddleware, wordCloudController.getMySessions);
router.get('/sessions/:id', wordCloudController.getSession); // Public read access for participants

module.exports = router;
