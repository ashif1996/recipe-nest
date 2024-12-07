const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Recipe = require("../models/recipeModel");

const HttpStatuscode = require("../utils/httpStatusCode");
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

// Logs out the user by clearing the authentication token from cookies
const userLogout = (req, res) => {
    res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    req.flash("success", "Logged out successfully!");
    res.status(HttpStatuscode.OK).redirect("/users/login");
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
            req.flash("error", "Category name already exists.");
            return res.status(HttpStatuscode.BAD_REQUEST).redirect("/users/add-category");
        }

        if (!req.file) {
            req.flash("error", "Image upload failed or no file uploaded.");
            return res.status(HttpStatuscode.BAD_REQUEST).redirect("/users/add-category");
        }

        const imagePath = req.file.filename;

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

const getEditCategory = async (req, res) => {
    const locals = { title: "Edit Recipe Category | RecipeNest" };
    const { id } = req.params;

    try {
        const category = await Category.findById(id);
        if (!category) {
            req.flash("error", `Category not found.`);
            return res.status(HttpStatuscode.NOT_FOUND).redirect("/categories");
        }

        const token = req.cookies.authToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            req.flash("error", `Token not found.`);
            return res.status(HttpStatuscode.FORBIDDEN).redirect("/categories");
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        if (category.userId.toString() !== userId) {
            req.flash("error", `Unauthorized access.`);
            return res.status(HttpStatuscode.FORBIDDEN).redirect("/categories");
        }

        return res.status(HttpStatuscode.OK).render("users/editCategory", {
            locals,
            category,
            layout: "layouts/mainLayout",
        });
    } catch (error) {
        console.error("Error fetching edit category:", error);

        req.flash("error", "Error fetching edit category.");
        return res.status(HttpStatuscode.INTERNAL_SERVER_ERROR).redirect("/categories");
    }
};

const editCategory = async (req, res) => {
    const { id } = req.params;
    const { categoryName, description } = req.body;

    try {
        const isExistingCategory = await Category.findById(id, "image");
        if (!isExistingCategory) {
            req.flash("error", `Category not found.`);
            return res.status(HttpStatuscode.BAD_REQUEST).json({ success: false });
        }

        const isCategoryNameExist = await Category.findOne({
            _id: { $ne: id },
            categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") },
        });
        if (isCategoryNameExist) {
            req.flash("error", `Category with this name already exists.`);
            return res.status(HttpStatuscode.BAD_REQUEST).json({ success: false });
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
            req.flash("error", `Failed to update category.`);
            return res.status(HttpStatuscode.INTERNAL_SERVER_ERROR).json({ success: false });
        }

        req.flash("success", `${categoryName} category updated successfully.`);
        return res.status(HttpStatuscode.OK).json({ success: true });
    } catch (error) {
        console.error("Error updating the category:", error);

        req.flash("error", "An error occurred while updating the category. Please try again.");
        return res.status(HttpStatuscode.INTERNAL_SERVER_ERROR).json({ success: false });
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

        req.flash("error", "Error fetching category.");
        return res.status(HttpStatuscode.INTERNAL_SERVER_ERROR).redirect("/users/login");
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
            req.flash("Recipe name already exists.");
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

        const token = req.cookies.authToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            req.flash("error", `Token not found.`);
            return res.status(HttpStatuscode.FORBIDDEN).redirect("/categories");
        }

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

        req.flash("success", `${recipeName} recipe added.`);
        return res.status(HttpStatuscode.CREATED).redirect("/recipes");
    } catch (error) {
        console.error("Error adding recipe:", error);

        req.flash("error", "Error adding recipe.");
        return res.status(HttpStatuscode.INTERNAL_SERVER_ERROR).redirect("/recipes");
    }
};

const getEditRecipe = async (req, res) => {
    const locals = { title: "Edit Recipe | RecipeNest" };
    const { id } = req.params;

    try {
        const recipe = await Recipe.findById(id);
        if (!recipe) {
            req.flash("error", `Recipe not found.`);
            return res.status(HttpStatuscode.BAD_REQUEST).json({ success: false });
        }

        const categories = await Category.find()
            .select("categoryName")
            .lean();

        recipe.ingredients = recipe.ingredients.join("\n");
        recipe.steps = recipe.steps.join("\n");           

        const token = req.cookies.authToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            req.flash("error", `Token not found.`);
            return res.status(HttpStatuscode.FORBIDDEN).redirect("/recipes");
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        if (recipe.userId.toString() !== userId) {
            req.flash("error", `Unauthorized access.`);
            return res.status(HttpStatuscode.FORBIDDEN).redirect("/recipes");
        }

        return res.status(HttpStatuscode.OK).render("users/editRecipe", {
            locals,
            recipe,
            categories,
            layout: "layouts/mainLayout",
        });
    } catch (error) {
        console.error("Error fetching edit recipe:", error);

        req.flash("error", "Error fetching edit recipe.");
        return res.status(HttpStatuscode.INTERNAL_SERVER_ERROR).redirect("/recipes");
    }
};

const editRecipe = async (req, res) => {
    const { id } = req.params;
    const { recipeName, category, preparationTime, servingSize, ingredients, steps } = req.body;

    try {
        const isExistingRecipe = await Recipe.findById(id, "image");
        if (!isExistingRecipe) {
            req.flash("error", "Recipe not found.");
            return res.status(HttpStatuscode.NOT_FOUND).json({ success: false });
        }

        const isExistingRecipeName = await Recipe.findOne({
            _id: { $ne: id },
            recipeName: { $regex: new RegExp(`^${recipeName}$`, "i") },
        });
        if (isExistingRecipeName) {
            req.flash("Recipe name already exists.");
            return res.status(HttpStatuscode.BAD_REQUEST).json({ success: false });
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
            req.flash("error", `Failed to update recipe.`);
            return res.status(HttpStatuscode.INTERNAL_SERVER_ERROR).json({ success: false });
        }

        req.flash("success", `${recipeName} updated successfully.`);
        return res.status(HttpStatuscode.OK).json({ success: true });
    } catch (error) {
        console.error("Error updating the recipe:", error);

        req.flash("error", "An error occurred while updating the recipe. Please try again.");
        return res.status(HttpStatuscode.INTERNAL_SERVER_ERROR).json({ success: false });
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

        req.flash("error", "Error fetching favourite recipes.");
        return res.status(HttpStatuscode.INTERNAL_SERVER_ERROR).redirect("/recipes");
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