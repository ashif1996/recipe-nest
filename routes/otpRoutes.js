const express = require("express");
const router = express.Router();

const OtpController = require("../controllers/otpController");

router.post("/send-otp", OtpController.sendOtpToUser);
router.post("/verify-otp", OtpController.handleOtpVerification);

module.exports = router;