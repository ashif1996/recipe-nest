const OTP = require("../models/otpModel");
const {
    generateOtp,
    storeOtp,
    sendOtp,
    verifyOtp,
    cleanupExpiredOtps
} = require("../utils/otpUtils");

const sendOtpToUser = async (req, res) => {
    const { email } = req.body;

    try {
        await cleanupExpiredOtps(email);

        const otp = generateOtp();
        await storeOtp(email, otp);
        await sendOtp(email, otp);

        req.flash("success", "OTP sent successfully.");
        return res.redirect("/users/signup");
    } catch (error) {
        console.log("An error occurred when processing OTP: ", error);
        
        req.flash("error", error.message || "Failed to process OTP. Please try again.");
        return res.redirect("/users/signup");
    }
};

const handleOtpVerification = async (req, res) => {
    const { otp } = req.body;

    try {
        const result = await verifyOtp(email, otp);
        if (result.isVerified) {
            req.flash("success", "OTP verified successfully.");
            return res.redirect("/users/signup");
        } else {
            const message = result.reason === "expired" ? "The OTP is expired." : "Invalid OTP.";
            req.flash("error", message);
            res.redirect("/users/signup");
        }
    } catch (error) {
        console.error("Error verifying OTP: ", error);

        req.flash("error", "Error verifying the OTP. Please try again.");
        res.redirect("/users/signup");
    }
};

module.exports = {
    sendOtpToUser,
    handleOtpVerification,
};