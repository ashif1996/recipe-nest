const jwt = require("jsonwebtoken");

const authenticateJWT = async (req, res, next) => {
    const token = req.cookies.authToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        req.flash("error", "Access denied. Token missing.");
        return res.redirect("/users/login");
    }

    try {
        const isVerified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = isVerified;
        next();
    } catch (error) {
        console.error("Error verifying the token:", error);

        req.flash("error", "Error verifying the token. Please log in again.");
        return res.redirect("/login");
    }
};

module.exports = authenticateJWT;