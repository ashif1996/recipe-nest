const crypto = require("crypto");
const OTP = require("../models/otpModel");
const transporter = require("../config/emailConfig");

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

const storeOtp = async (email, otp) => {
    try {
        await OTP.deleteMany({ email });

        const newOtp = new OTP({
            email,
            otp,
            expiresAt: new Date(Date.now() + 1 * 60 * 1000),
        });
        await newOtp.save();
    } catch (error) {
        console.error("Error storing the OTP:", error);
        throw new Error("Failed to store OTP.");
    }
};

const sendOtp = async (email, otp) => {
    const mailOptions = {
        from: process.env.SEND_OTP_EMAIL,
        to: email,
        subject: "OTP Code For RecipeNest Registration",
        html: `<p>Your OTP is: <strong>${otp}</strong>. It will expire in 2 minutes. Please do not share this code with anyone.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("OTP sent successfully to:", email);
    } catch (error) {
        console.error("Error sending the OTP:", error);
        throw new Error("Failed to send OTP.");
    }    
};

const verifyOtp = async (email, otp) => {
    try {
        const latestOtp = await OTP.findOne({ email })
            .sort({ expiresAt: -1 })
            .exec();
        if (!latestOtp) {
            return { isVerified: false, reason: "notFound" };
        }

        const isExpired = new Date() > latestOtp.expiresAt;
        if (isExpired) {
            await OTP.deleteOne({ email: latestOtp.email, otp: latestOtp.otp });
            return { isVerified: false, reason: "expired" };
        }

        const isMatch = otp === latestOtp.otp;
        if (isMatch) {
            await OTP.deleteMany({ email });
            return { isVerified: true };
        } else {
            return { isVerified: false, reason: "invalid" };
        }
    } catch (error) {
        console.error("Failed to verify the OTP:", error);
        throw new Error("Failed to verify the OTP.");
    }
};

const cleanupExpiredOtps = async () => {
    const now = new Date();
    try {
        await OTP.deleteMany({ expiresAt: { $lte: now } });
        console.log("Expired OTP's cleaned up successfully.");
    } catch (error) {
        console.error("Error cleaning up expired OTP's:", error);
        throw new Error("Failed to cleanup expired OTP's.");
    }
};

module.exports = {
    generateOtp,
    storeOtp,
    sendOtp,
    verifyOtp,
    cleanupExpiredOtps,
};
