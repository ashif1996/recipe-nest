const jwt = require("jsonwebtoken");
const httpStatusCode = require("../utils/httpStatusCode");

const authenticateJWT = (req, res, next) => {
    const token = req.cookies.authToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        req.flash("error", "Access denied. Please log in.");
        return res.status(httpStatusCode.UNAUTHORIZED).redirect("/users/login");
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                req.flash("error", "Session has expired. Please log in again.");
                return res.status(httpStatusCode.UNAUTHORIZED).redirect("/users/login");
            }

            req.flash("error", "Invalid token. Please log in again.");
            return res.status(httpStatusCode.UNAUTHORIZED).redirect("/users/login");
        }

        req.user = decoded;
        next();
    });    
};

module.exports = authenticateJWT;