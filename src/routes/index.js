const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const auth = require("./auth.routes");

router.use('/users', userRoutes);
router.use("/auth",auth);

module.exports = router;
