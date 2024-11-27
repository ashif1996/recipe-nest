const {
    generateOtp,
    storeOtp,
    sendOtp,
    verifyOtp,
    cleanupExpiredOtps
} = require("../utils/otpUtils");

const HttpStatus = require("../utils/httpStatusCode");

const sendOtpToUser = async (req, res) => {
    const { email, redirectUrl } = req.body;

    try {
        await cleanupExpiredOtps();

        const otp = generateOtp();
        console.log("Generated OTP:", otp);
        await storeOtp(email, otp);
        await sendOtp(email, otp);

        req.session.otpSend = true;
        req.session.email = email;

        return res.status(HttpStatus.OK).json({
            success: true,
            otpSend: true,
            message: "OTP sent successfully.",
            redirectUrl,
        });
    } catch (error) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            otpSend: false,
            message: error.message || "Failed to send OTP.",
            redirectUrl,
        });
    }
};

const handleOtpVerification = async (req, res) => {
    const { otp, redirectUrl } = req.body;
    const email = req.session.email;

    try {
        const result = await verifyOtp(email, otp);
        if (result.isVerified) {
            req.session.otpSend = false;

            return res.status(HttpStatus.OK).json({
                success: true,
                message: "OTP verified successfully.",
                redirectUrl,
            });
        } else {
            const message = result.reason === "expired" ? "The OTP has expired." : "Invalid OTP.";
            return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
        }
    } catch (error) {
        console.error("Error verifying OTP: ", error);

        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "An error occurred while verifying OTP.",
            redirectUrl,
        });
    }
};

module.exports = {
    sendOtpToUser,
    handleOtpVerification,
};