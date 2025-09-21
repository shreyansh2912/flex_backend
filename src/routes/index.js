const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const userRoutes = require('./user.routes');
const auth = require("./auth.routes");

router.use("/auth",auth);
router.use('/users',authMiddleware, userRoutes);
router.use('/form',authMiddleware, userRoutes);

module.exports = router;
