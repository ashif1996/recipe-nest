const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
    try {
        const token = req.cookies.authToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            req.flash("error", "Access denied. Please log in.");
            return res.redirect("/users/login");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();
    } catch (error) {
        console.error("Error verifying the token:", error);

        req.flash("error", "Session expired. Please log in again.");
        return res.redirect("/users/login");
    }
};

module.exports = authenticateJWT;