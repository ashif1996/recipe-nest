const transporter = require("../config/emailConfig");

const sendEmail = async (name, email, message) => {
    const mailOptions = {
        from: process.env.SEND_EMAIL,
        to: "faithfuldebates@gmail.com",
        subject: "📬 New Message from RecipeNest Contact Form",
        text: `
Hello,

You have received a new message through the RecipeNest Contact Us form:

----------------------------------------------------
👤 Name: ${name}  
📧 Email: ${email}

💬 Message:

${message}
----------------------------------------------------

Best regards,
RecipeNest Notification System
        `,
        replyTo: email,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error("Email sending failed:", error);
        throw new Error("Email sending failed");
    }
};

module.exports = sendEmail;