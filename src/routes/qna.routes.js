const express = require('express');
const router = express.Router();
const qnaController = require('../controllers/qna.controller');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');

router.get('/', optionalAuthMiddleware, qnaController.getQnASessions);

module.exports = router;
