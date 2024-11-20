require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const Category = require("../models/categoryModel");
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
            expiresIn: 3600,
        });

        res.cookie("authToken", token, {
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

    try {
        const isExistingUser = await User.findOne({ email });
        if (isExistingUser) {
            req.flash("error", "Email already taken.");
            return res.redirect("/users/signup");
        }

        if (password !== confirmPassword) {
            req.flash("error", "Passwords do not match.");
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

const userLogout = (req, res) => {
    res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    req.flash("success", "Logged out successfully!");
    res.redirect("/users/login");
};

const getFavouriteRecipes = (req, res) => {
    const locals = { title: "Favourite Recipes | RecipeNest" };
    return res.status(HttpStatuscode.OK).render("users/favourites", {
        locals,
        layout: "layouts/mainLayout",
    });
};

const getAddCategory = (req, res) => {
    const locals = { title: "Add Recipe | RecipeNest" };
    return res.status(HttpStatuscode.OK).render("users/addCategory", {
        locals,
        layout: "layouts/mainLayout",
    });
};

const addCategory = async (req, res) => {
    const { categoryName, description } = req.body;

    try {
        const isExistingCategory = await Category.findOne({
            categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") },
        });
        if (isExistingCategory) {
            req.flash("error", "Category already exists.");
            return res.redirect("/users/categories/add");
        }

        if (!req.file) {
            req.flash("error", "Image upload failed or no file uploaded.");
            return res.redirect("/users/categories/add");
        }

        const imagePath = `/images/categories/${req.file.filename}`;

        const newCategory = new Category({
            categoryName,
            description,
            image: imagePath,
        });
        await newCategory.save();

        req.flash("success", `${categoryName} category created.`);
        return res.redirect("/categories");
    } catch (error) {
        console.error("Error creating category:", error);

        req.flash("error", "Error creating category.");
        return res.redirect("/categories");
    }
};

const getAddRecipe = (req, res) => {
    const locals = { title: "Add Recipe | RecipeNest" };
    return res.status(HttpStatuscode.OK).render("users/addRecipe", {
        locals,
        layout: "layouts/mainLayout",
    });
};

const addRecipe = (req, res) => {

};

module.exports = {
    getUserLogin,
    userLogin,
    getUserSignup,
    userSignup,
    userLogout,
    getFavouriteRecipes,
    getAddCategory,
    addCategory,
    getAddRecipe,
    addRecipe,
};