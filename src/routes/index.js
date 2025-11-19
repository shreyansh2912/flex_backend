const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const userRoutes = require('./user.routes');
const formRoutes = require('./form.routes');
const auth = require("./auth.routes");
const formDataRoutes = require("./formData.routes.js");

router.use("/auth",auth);
router.use('/users',authMiddleware, userRoutes);
router.use('/form',authMiddleware, formRoutes);
router.use('/form-data',authMiddleware,formDataRoutes);

module.exports = router