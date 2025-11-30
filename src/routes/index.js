const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const userRoutes = require('./user.routes');
const formRoutes = require('./form.routes');
const auth = require("./auth.routes");
const formDataRoutes = require("./formData.routes.js");
const wordCloudRoutes = require('./wordCloud.routes');
const pollRoutes = require('./poll.routes');
const qnaRoutes = require('./qna.routes');

router.use("/auth", auth);
router.use('/users', authMiddleware, userRoutes);
router.use('/form', formRoutes);
router.use('/form-data', authMiddleware, formDataRoutes);
router.use('/word-cloud', wordCloudRoutes);
router.use('/polls', pollRoutes);
router.use('/qna', qnaRoutes);

module.exports = router;