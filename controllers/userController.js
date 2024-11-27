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
            return res.status(HttpStatuscode.NOT_FOUND).redirect("/users/login");
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            req.flash("error", "Password does not match.");
            return res.status(HttpStatuscode.UNAUTHORIZED).redirect("/users/login");
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
            sameSite: "strict",
        });

        req.flash("success", "Login successful!");
        return res.status(HttpStatuscode.OK).redirect("/");
    } catch (error) {
        console.error("Error verifying the credentials:", error);

        req.flash("error", "An error occurred. Please try again later.");
        return res.status(HttpStatuscode.INTERNAL_SERVER_ERROR).redirect("/users/login");
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
            return res.status(HttpStatuscode.BAD_REQUEST).redirect("/users/signup");
        }

        if (password !== confirmPassword) {
            req.flash("error", "Passwords do not match.");
            return res.status(HttpStatuscode.BAD_REQUEST).redirect("/users/signup");
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
        return res.status(HttpStatuscode.CREATED).redirect("/users/login");
    } catch (error) {
        console.error("Error registering the user:", error);

        req.flash("error", "An error occurred. Please try again.");
        return res.status(HttpStatuscode.INTERNAL_SERVER_ERROR).redirect("/users/signup");
    }
};

const userLogout = (req, res) => {
    res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    req.flash("success", "Logged out successfully!");
    res.status(HttpStatuscode.OK).redirect("/users/login");
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
            return res.status(HttpStatuscode.BAD_REQUEST).redirect("/users/add-category");
        }

        if (!req.file) {
            req.flash("error", "Image upload failed or no file uploaded.");
            return res.status(HttpStatuscode.BAD_REQUEST).redirect("/users/add-category");
        }

        const imagePath = `/images/categories/${req.file.filename}`;

        const newCategory = new Category({
            categoryName,
            description,
            image: imagePath,
        });

        await newCategory.save();

        req.flash("success", `${categoryName} category added.`);
        return res.status(HttpStatuscode.CREATED).redirect("/categories");
    } catch (error) {
        console.error("Error creating category:", error);

        req.flash("error", "Error creating category.");
        return res.status(HttpStatuscode.INTERNAL_SERVER_ERROR).redirect("/categories");
    }
};

const getAddRecipe = async (req, res) => {
    const locals = { title: "Add Recipe | RecipeNest" };
    
    try {
        const categories = await Category.find()
            .select("categoryName")
            .lean();

        return res.status(HttpStatuscode.OK).render("users/addRecipe", {
            locals,
            categories,
            layout: "layouts/mainLayout",
        });
    } catch (error) {
        console.error("Error fetching category:", error);

        req.flash("error", "Error fetching category.");
        return res.status(HttpStatuscode.INTERNAL_SERVER_ERROR).redirect("/users/login");
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
            return res.status(HttpStatuscode.BAD_REQUEST).redirect("/users/add-recipe");
        }

        const categoryId = await Category.findOne({ categoryName: category }).select("_id");
        if (!categoryId) {
            req.flash("error", "Invalid category selected.");
            return res.status(HttpStatuscode.BAD_REQUEST).redirect("/users/add-recipe");
        }

        if (!req.file) {
            req.flash("error", "Image upload failed or no file uploaded.");
            return res.status(HttpStatuscode.BAD_REQUEST).redirect("/users/add-recipe");
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
        return res.status(HttpStatuscode.CREATED).redirect("/recipes");
    } catch (error) {
        console.error("Error adding recipe:", error);

        req.flash("error", "Error adding recipe.");
        return res.status(HttpStatuscode.INTERNAL_SERVER_ERROR).redirect("/recipes");
    }
};

const addFavouriteRecipes = async (req, res) => {
    const token = req.cookies.authToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res.status(HttpStatuscode.UNAUTHORIZED).json({
            ok: false,
            message: "Please login to add recipe to favourites.",
        });
    }

    const { recipeId } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const user = await User.findById(userId).select("favourites");
        if (!user) {
            return res.status(HttpStatuscode.NOT_FOUND).json({
                ok: false,
                message: "User not found.",
            });
        }

        if (user.favourites.includes(recipeId)) {
            return res.status(HttpStatuscode.BAD_REQUEST).json({
                ok: false,
                message: "Recipe is already in your favorites.",
            });
        }

        await User.findOneAndUpdate(
            { _id: userId },
            { $addToSet: { favourites: recipeId } },
            { new: true },
        );

        return res.status(HttpStatuscode.OK).json({
            ok: true,
            message: "Recipe added to favorites successfully!",
        });
    } catch (error) {
        console.error("Failed to add recipe to favorites:", error);
        return res.status(HttpStatuscode.INTERNAL_SERVER_ERROR).json({
            ok: false,
            message: "Failed to add recipe to favorites.",
        });
    }
};

const getFavouriteRecipes = async (req, res) => {
    const locals = { title: "Favourite Recipes | RecipeNest" };
    const userId = req.user.userId;

    try {
        const user = await User.findById(userId)
            .select("favourites")
            .populate({
                path: "favourites",
                select: "recipeName image category preparationTime",
                populate: {
                    path: "category",
                    select: "categoryName",
                },
            })
            .lean();

        const favourites = user ? user.favourites : [];

        return res.status(HttpStatuscode.OK).render("users/favourites", {
            locals,
            favourites,
            layout: "layouts/mainLayout",
        });
    } catch (error) {
        console.error("Error fetching favourite recipes:", error);

        req.flash("error", "Error fetching favourite recipes.");
        return res.status(HttpStatuscode.INTERNAL_SERVER_ERROR).redirect("/recipes");
    }
};

module.exports = {
    getUserLogin,
    userLogin,
    getUserSignup,
    userSignup,
    userLogout,
    getAddCategory,
    addCategory,
    getAddRecipe,
    addRecipe,
    addFavouriteRecipes,
    getFavouriteRecipes,
};