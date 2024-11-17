require("dotenv").config();
const cookie = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const HttpStatuscode = require("../utils/httpStatusCode");

const getUserLogin = (req, res) => {
    const locals = { title: "User Login | RecipeNest" };
    return res.status(HttpStatuscode.OK).render("users/login", {
        locals,
        layout: "layouts/authLayout",
    });
};

const userLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        req.flash("error", "All fields are required.");
        return res.redirect("/users/login");
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.flash("error", "User not found. Please try again.");
            return res.redirect("/users/login");
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            req.flash("error", "Password does not match.");
            return res.redirect("/users/login");
        }

        const payload = {
            userId: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_SECRET_TIME,
        });

        res.cookie("authtoken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24,
        });

        req.flash("success", "Login successful!");
        return res.redirect("/");
    } catch (error) {
        console.error("Error verifying the credentials:", error);

        req.flash("error", "An error occurred. Please try again later.");
        return res.redirect("/users/login");
    }
};

const getUserSignup = (req, res) => {
    const locals = { title: "User SignUp | RecipeNest" };
    return res.status(HttpStatuscode.OK).render("users/signup", {
        locals,
        layout: "layouts/authLayout",
    });
};

const userSignup = async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        req.flash("error", "All fields are required.");
        return res.redirect("/users/signup");
    }

    try {
        const isExistingUser = await User.findOne({ email });
        if (isExistingUser) {
            req.flash("error", "Email already taken.");
            return res.redirect("/users/signup");
        }

        if (password !== confirmPassword) {
            req.flash("error", "Passwords donot match.");
            return res.redirect("/users/signup");
        }

        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
            favourites: [],
        });
        await newUser.save();

        req.flash("success", "User registration successfull.");
        return res.redirect("/users/login");
    } catch (error) {
        console.error("Error registering the user:", error);

        req.flash("error", "An error occurred. Please try again.");
        return res.redirect("/users/signup");
    }
};

module.exports = {
    getUserLogin,
    userLogin,
    getUserSignup,
    userSignup,
};