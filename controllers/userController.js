require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Recipe = require("../models/recipeModel");
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
            return res.redirect("/users/add-category");
        }

        if (!req.file) {
            req.flash("error", "Image upload failed or no file uploaded.");
            return res.redirect("/users/add-category");
        }

        const imagePath = `/images/categories/${req.file.filename}`;

        const newCategory = new Category({
            categoryName,
            description,
            image: imagePath,
        });
        
        await newCategory.save();

        req.flash("success", `${categoryName} category added.`);
        return res.redirect("/categories");
    } catch (error) {
        console.error("Error creating category:", error);

        req.flash("error", "Error creating category.");
        return res.redirect("/categories");
    }
};

const getAddRecipe = async (req, res) => {
    const locals = { title: "Add Recipe | RecipeNest" };
    
    try {
        const categories = await Category.find();

        return res.status(HttpStatuscode.OK).render("users/addRecipe", {
            locals,
            categories,
            layout: "layouts/mainLayout",
        });
    } catch (error) {
        console.error("Error fetching category:", error);

        req.flash("error", "Error fetching category.");
        return res.redirect("/users/login");
    }
};

const addRecipe = async (req, res) => {
    const { recipeName, category, image, preparationTime, servingSize, ingredients, steps } = req.body;

    try {
        const isExistingRecipe = await Recipe.findOne({ 
            recipeName: { $regex: new RegExp(`^${recipeName}$`, "i") },
        });
        if (isExistingRecipe) {
            req.flash("Recipe already exists.");
            return res.redirect("/users/add-recipe");
        }

        const categoryId = await Category.findOne({ categoryName: category });
        if (!categoryId) {
            req.flash("error", "Invalid category selected.");
            return res.redirect("/users/add-recipe");
        }

        if (!req.file) {
            req.flash("error", "Image upload failed or no file uploaded.");
            return res.redirect("/users/add-recipe");
        }

        const imagePath = req.file.filename;

        const newRecipe = new Recipe({
            recipeName,
            category: categoryId,
            image: imagePath,
            preparationTime,
            servingSize,
            ingredients: ingredients.split("\n"),
            steps: steps.split("\n"),
        });

        await newRecipe.save();

        req.flash("success", `${recipeName} recipe added.`);
        return res.redirect("/recipes");
    } catch (error) {
        console.error("Error adding recipe:", error);

        req.flash("error", "Error adding recipe.");
        return res.redirect("/recipes");
    }
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