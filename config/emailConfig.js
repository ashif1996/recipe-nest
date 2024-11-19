const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SEND_OTP_EMAIL,
        pass: process.env.SEND_OTP_EMAIL_PASS,
    },
    secure: true,
});

module.exports = transporter;