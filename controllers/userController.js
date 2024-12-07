const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Recipe = require("../models/recipeModel");

const showFlashMessages = require("../utils/messageUtils");
const HttpStatuscode = require("../utils/httpStatusCode");
const { fetchUserId, isTokenPresent } = require("../utils/userUtils");
const sendEmail = require("../utils/emailUtils");

// Renders the login page for users
const getUserLogin = (req, res) => {
    const locals = { title: "User Login | RecipeNest" };
    return res.status(HttpStatuscode.OK).render("users/login", {
        locals,
        layout: "layouts/authLayout",
    });
};

// Handles user login by verifying credentials, generating a JWT token, and setting it in cookies
const userLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return showFlashMessages({
                req,
                res,
                type: "error",
                message: "User not found. Please try again.",
                status: HttpStatuscode.NOT_FOUND,
                redirectUrl: "/users/login",
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return showFlashMessages({
                req,
                res,
                type: "error",
                message: "Password does not match.",
                status: HttpStatuscode.UNAUTHORIZED,
                redirectUrl: "/users/login",
            });
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

        return showFlashMessages({
            req,
            res,
            type: "success",
            message: "Login successful!",
            status: HttpStatuscode.OK,
            redirectUrl: "/",
        });
    } catch (error) {
        console.error("Error verifying the credentials:", error);
        return showFlashMessages({
            req,
            res,
            type: "error",
            message: "An error occurred. Please try again later.",
            status: HttpStatuscode.INTERNAL_SERVER_ERROR,
            redirectUrl: "/users/login",
        });
    }
};

// Renders the signup page for new users
const getUserSignup = (req, res) => {
    const locals = { title: "User SignUp | RecipeNest" };
    return res.status(HttpStatuscode.OK).render("users/signup", {
        locals,
        layout: "layouts/authLayout",
    });
};

// Handles user registration by validating inputs
const userSignup = async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    try {
        const isExistingUser = await User.findOne({ email });
        if (isExistingUser) {
            return showFlashMessages({
                req,
                res,
                type: "error",
                message: "Email already taken.",
                status: HttpStatuscode.BAD_REQUEST,
                redirectUrl: "/users/signup",
            });
        }

        if (password !== confirmPassword) {
            return showFlashMessages({
                req,
                res,
                type: "error",
                message: "Passwords do not match.",
                status: HttpStatuscode.BAD_REQUEST,
                redirectUrl: "/users/signup",
            });
        }

        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
            favourites: [],
        });

        await newUser.save();

        return showFlashMessages({
            req,
            res,
            type: "success",
            message: "User registration successfull.",
            status: HttpStatuscode.CREATED,
            redirectUrl: "/users/login",
        });
    } catch (error) {
        console.error("Error registering the user:", error);
        return showFlashMessages({
            req,
            res,
            type: "error",
            message: "An error occurred. Please try again later.",
            status: HttpStatuscode.INTERNAL_SERVER_ERROR,
            redirectUrl: "/users/signup",
        });
    }
};

// Logs out the user by clearing the authentication token from cookies
const userLogout = (req, res) => {
    res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    return showFlashMessages({
        req,
        res,
        type: "success",
        message: "Logged out successfully!",
        status: HttpStatuscode.OK,
        redirectUrl: "/users/login",
    });
};

// Renders the page to add categoies
const getAddCategory = (req, res) => {
    const locals = { title: "Add Recipe Category | RecipeNest" };
    return res.status(HttpStatuscode.OK).render("users/addCategory", {
        locals,
        layout: "layouts/mainLayout",
    });
};

// Handles the addition of a new category
const addCategory = async (req, res) => {
    const { categoryName, description } = req.body;

    try {
        const isCategoryNameExist = await Category.findOne({
            categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") },
        });
        if (isCategoryNameExist) {
            return showFlashMessages({
                req,
                res,
                type: "error",
                message: "Category name already exists.",
                status: HttpStatuscode.BAD_REQUEST,
                redirectUrl: "/users/add-category",
            });
        }

        if (!req.file) {
            return showFlashMessages({
                req,
                res,
                type: "error",
                message: "Image upload failed or no file uploaded.",
                status: HttpStatuscode.BAD_REQUEST,
                redirectUrl: "/users/add-category",
            });
        }

        const imagePath = req.file.filename;

        const newCategory = new Category({
            categoryName,
            description,
            image: imagePath,
        });

        await newCategory.save();

        return showFlashMessages({
            req,
            res,
            type: "success",
            message: `${categoryName} category added.`,
            status: HttpStatuscode.CREATED,
            redirectUrl: "/categories",
        });
    } catch (error) {
        console.error("Error creating category:", error);
        return showFlashMessages({
            req,
            res,
            type: "error",
            message: "An error occurred. Please try again later.",
            status: HttpStatuscode.INTERNAL_SERVER_ERROR,
            redirectUrl: "/categories",
        });
    }
};

const getEditCategory = async (req, res) => {
    const locals = { title: "Edit Recipe Category | RecipeNest" };
    const { id } = req.params;

    try {
        const category = await Category.findById(id);
        if (!category) {
            return showFlashMessages({
                req,
                res,
                type: "error",
                message: "Category not found.",
                status: HttpStatuscode.NOT_FOUND,
                redirectUrl: "/categories",
            });
        }

        const token = isTokenPresent(req, "/categories");
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        if (category.userId.toString() !== userId) {
            return showFlashMessages({
                req,
                res,
                type: "error",
                message: "Unauthorized access.",
                status: HttpStatuscode.FORBIDDEN,
                redirectUrl: "/categories",
            });
        }

        return res.status(HttpStatuscode.OK).render("users/editCategory", {
            locals,
            category,
            layout: "layouts/mainLayout",
        });
    } catch (error) {
        console.error("Error fetching edit category:", error);
        return showFlashMessages({
            req,
            res,
            type: "error",
            message: "An error occurred. Please try again later.",
            status: HttpStatuscode.INTERNAL_SERVER_ERROR,
            redirectUrl: "/categories",
        });
    }
};

const editCategory = async (req, res) => {
    const { id } = req.params;
    const { categoryName, description } = req.body;

    try {
        const isExistingCategory = await Category.findById(id, "image");
        if (!isExistingCategory) {
            return showFlashMessages({
                req,
                res,
                type: "error",
                message: "Category not found.",
                status: HttpStatuscode.BAD_REQUEST,
                isJson: true,
            });
        }

        const isCategoryNameExist = await Category.findOne({
            _id: { $ne: id },
            categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") },
        });
        if (isCategoryNameExist) {
            return showFlashMessages({
                req,
                res,
                type: "error",
                message: "Category with this name already exists.",
                status: HttpStatuscode.BAD_REQUEST,
                isJson: true,
            });
        }

        let updatedImagePath = isExistingCategory.image;
        if (req.file) {
            updatedImagePath = req.file.filename;
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { categoryName, description, image: updatedImagePath },
            { new: true },
        );
        if (!updatedCategory) {
            return showFlashMessages({
                req,
                res,
                type: "error",
                message: "Failed to update category.",
                status: HttpStatuscode.INTERNAL_SERVER_ERROR,
                isJson: true,
            });
        }

        return showFlashMessages({
            req,
            res,
            type: "success",
            message: `${categoryName} category updated successfully.`,
            status: HttpStatuscode.OK,
            isJson: true,
            success: true,
        });
    } catch (error) {
        console.error("Error updating the category:", error);
        return showFlashMessages({
            req,
            res,
            type: "error",
            message: "An error occurred while updating the category. Please try again.",
            status: HttpStatuscode.INTERNAL_SERVER_ERROR,
            isJson: true,
        });
    }
};

// Renders the page to add recipe
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
        return showFlashMessages({
            req,
            res,
            type: "error",
            message: "An error occurred. Please try again later.",
            status: HttpStatuscode.INTERNAL_SERVER_ERROR,
            redirectUrl: "/users/login",
        });
    }
};

// Handles the addition of a new recipe
const addRecipe = async (req, res) => {
    const { recipeName, category, preparationTime, servingSize, ingredients, steps } = req.body;

    try {
        const isRecipeNameExist = await Recipe.findOne({ 
            recipeName: { $regex: new RegExp(`^${recipeName}$`, "i") },
        });
        if (isRecipeNameExist) {
            return showFlashMessages({
                req,
                res,
                type: "error",
                message: "Recipe name already exists.",
                status: HttpStatuscode.BAD_REQUEST,
                redirectUrl: "/users/add-recipe",
            });
        }

        const categoryId = await Category.findOne({ categoryName: category }).select("_id");
        if (!categoryId) {
            return showFlashMessages({
                req,
                res,
                type: "error",
                message: "Invalid category selected.",
                status: HttpStatuscode.BAD_REQUEST,
                redirectUrl: "/users/add-recipe",
            });
        }

        if (!req.file) {
            return showFlashMessages({
                req,
                res,
                type: "error",
                message: "Image upload failed or no file uploaded.",
                status: HttpStatuscode.BAD_REQUEST,
                redirectUrl: "/users/add-recipe",
            });
        }

        const imagePath = req.file.filename;

        const token = isTokenPresent(req, "/users/add-recipe");
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        const newRecipe = new Recipe({
            userId,
            recipeName,
            category: categoryId,
            image: imagePath,
            preparationTime,
            servingSize,
            ingredients: ingredients.split("\n"),
            steps: steps.split("\n"),
        });

        await newRecipe.save();

        return showFlashMessages({
            req,
            res,
            type: "success",
            message: `${recipeName} recipe added.`,
            status: HttpStatuscode.CREATED,
            redirectUrl: "/recipes",
        });
    } catch (error) {
        console.error("Error adding recipe:", error);
        return showFlashMessages({
            req,
            res,
            type: "error",
            message: "An error occurred. Please try again later.",
            status: HttpStatuscode.INTERNAL_SERVER_ERROR,
            redirectUrl: "/recipes",
        });
    }
};

const getEditRecipe = async (req, res) => {
    const locals = { title: "Edit Recipe | RecipeNest" };
    const { id } = req.params;

    try {
        const recipe = await Recipe.findById(id);
        if (!recipe) {
            return showFlashMessages({
                req,
                res,
                type: "error",
                message: "Recipe not found.",
                status: HttpStatuscode.BAD_REQUEST,
                isJson: true,
            });
        }

        const categories = await Category.find()
            .select("categoryName")
            .lean();

        recipe.ingredients = recipe.ingredients.join("\n");
        recipe.steps = recipe.steps.join("\n");           

        const token = isTokenPresent(req, "/recipes");
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        if (recipe.userId.toString() !== userId) {
            return showFlashMessages({
                req,
                res,
                type: "error",
                message: "Unauthorized access.",
                status: HttpStatuscode.FORBIDDEN,
                redirectUrl: "/recipes",
            });
        }

        return res.status(HttpStatuscode.OK).render("users/editRecipe", {
            locals,
            recipe,
            categories,
            layout: "layouts/mainLayout",
        });
    } catch (error) {
        console.error("Error fetching edit recipe:", error);
        return showFlashMessages({
            req,
            res,
            type: "error",
            message: "An error occurred. Please try again later.",
            status: HttpStatuscode.INTERNAL_SERVER_ERROR,
            redirectUrl: "/recipes",
        });
    }
};

const editRecipe = async (req, res) => {
    const { id } = req.params;
    const { recipeName, category, preparationTime, servingSize, ingredients, steps } = req.body;

    try {
        const isExistingRecipe = await Recipe.findById(id, "image");
        if (!isExistingRecipe) {
            return showFlashMessages({
                req,
                res,
                type: "error",
                message: "Recipe not found.",
                status: HttpStatuscode.NOT_FOUND,
                isJson: true,
            });
        }

        const isExistingRecipeName = await Recipe.findOne({
            _id: { $ne: id },
            recipeName: { $regex: new RegExp(`^${recipeName}$`, "i") },
        });
        if (isExistingRecipeName) {
            return showFlashMessages({
                req,
                res,
                type: "error",
                message: "Recipe name already exists.",
                status: HttpStatuscode.BAD_REQUEST,
                isJson: true,
            });
        }

        let updatedImagePath = isExistingRecipe.image;
        if (req.file) {
            updatedImagePath = req.file.filename;
        }

        const updatedRecipe = await Recipe.findByIdAndUpdate(
            id,
            {
                recipeName,
                category,
                image: updatedImagePath,
                preparationTime,
                servingSize,
                ingredients: ingredients.split("\n"),
                steps: steps.split("\n"),
            },
            { new: true },
        );
        if (!updatedRecipe) {
            return showFlashMessages({
                req,
                res,
                type: "error",
                message: "Failed to update recipe.",
                status: HttpStatuscode.INTERNAL_SERVER_ERROR,
                isJson: true,
            });
        }

        return showFlashMessages({
            req,
            res,
            type: "success",
            message: `${recipeName} updated successfully.`,
            status: HttpStatuscode.OK,
            isJson: true,
            success: true,
        });
    } catch (error) {
        console.error("Error updating the recipe:", error);
        return showFlashMessages({
            req,
            res,
            type: "error",
            message: "An error occurred while updating the recipe. Please try again.",
            status: HttpStatuscode.INTERNAL_SERVER_ERROR,
            isJson: true,
        });
    }
};

// Adds a recipe to the user's list of favorites
const addFavouriteRecipes = async (req, res) => {
    const token = req.cookies.authToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res.status(HttpStatuscode.UNAUTHORIZED).json({
            ok: false,
            message: "Please login to add recipe to favourites.",
        });
    }

    let userId;

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(HttpStatuscode.UNAUTHORIZED).json({
                    ok: false,
                    message: "Token has expired.",
                });
            } else if (err.name === "JsonWebTokenError") {
                return res.status(HttpStatuscode.UNAUTHORIZED).json({
                    ok: false,
                    message: "Token is invalid.",
                });
            }
        }

        userId = decoded.userId;
    });

    if (!userId) {
        return;
    }

    try {
        const { recipeId } = req.body;

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

// Fetches and renders the user's favorite recipes
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
        return showFlashMessages({
            req,
            res,
            type: "error",
            message: "An error occurred. Please try again later.",
            status: HttpStatuscode.INTERNAL_SERVER_ERROR,
            redirectUrl: "/recipes",
        });
    }
};

// Handles sending an email through the contact form
const processSendEmail = async (req, res) => {
    const { name, email, message } = req.body;

    try {
        await sendEmail(name, email, message);

        res.status(HttpStatuscode.OK).json({
            success: true,
            message: "Email sent successfully.",
        });
    } catch (error) {
        console.error("Failed to send email:", error);

        return res.status(HttpStatuscode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to send email.',
        });
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
    getEditCategory,
    editCategory,
    getAddRecipe,
    addRecipe,
    getEditRecipe,
    editRecipe,
    addFavouriteRecipes,
    getFavouriteRecipes,
    processSendEmail,
};