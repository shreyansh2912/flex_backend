const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const validateRequest = require("../middlewares/requestValidator");
const { sendOtpSchema, verifyOtpSchema } = require("../utils/schema/loginSchema");

// router.get("/register",authController.register);
router.post("/send-otp", validateRequest(sendOtpSchema), authController.sendOtp);
router.post("/verify-otp", validateRequest(verifyOtpSchema) ,authController.verifyOtp);

module.exports = router;