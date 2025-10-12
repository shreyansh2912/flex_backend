const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const validateRequest = require("../middlewares/requestValidator");
const { sendOtpSchema } = require("../utils/schema/loginSchema");

// router.get("/register",authController.register);
router.post("/send-otp", validateRequest(sendOtpSchema), authController.sendOtp);
router.post("/verify-otp",authController.verifyOtp);

module.exports = router;