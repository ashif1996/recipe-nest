const Category = require("../models/categoryModel");
const Recipe = require("../models/recipeModel");
const HttpStatuscode = require("../utils/httpStatusCode");

const getHome = async (req, res) => {
    const locals = { title: "Home | RecipeNest" };

    try {
        const categories = await Category.find().limit(3);
        const recipes = await Recipe.find().populate("category").limit(3);

        return res.status(HttpStatuscode.OK).render("index", {
            locals,
            categories,
            recipes,
            layout: "layouts/mainLayout",
        });
    } catch (error) {
        console.error("Error fetching category:", error);

        req.flash("error", "Error fetching category.");
        return res.redirect("/users/login");
    }
};

const getContact = (req, res) => {
    const locals = { title: "Contact Us | RecipeNest" };
    return res.status(HttpStatuscode.OK).render("contact", {
        locals,
        layout: "layouts/mainLayout",
    });
};

const getRecipes = async (req, res) => {
    const locals = { title: "Recipes | RecipeNest" };

    try {
        const recipes = await Recipe.find().populate("category");

        return res.status(HttpStatuscode.OK).render("recipes", {
            locals,
            recipes,
            layout: "layouts/mainLayout",
        });
    } catch (error) {
        console.error("Error fetching recipes:", error);

        req.flash("error", "Error fetching recipes.");
        return res.redirect("/");
    }
};

const getRecipeDetails = async (req, res) => {
    const locals = { title: "Recipe Details | RecipeNest" };
    const { id } = req.params;

    try {
        const recipe = await Recipe.findById(id).populate("category");

        const similarRecipes = await Recipe.find({ category: recipe.category })
            .populate("category")
            .limit(3);

        return res.status(HttpStatuscode.OK).render("recipeDetails", {
            locals,
            recipe,
            similarRecipes,
            layout: "layouts/mainLayout",
        });
    } catch (error) {
        console.error("Error fetching recipe details:", error);

        req.flash("error", "Error fetching recipe details.");
        return res.redirect("/");
    }
};

const getCategories = async (req, res) => {
    const locals = { title: "Recipe Categories | RecipeNest" };

    try {
        const categories = await Category.find();

        return res.status(HttpStatuscode.OK).render("categories", {
            locals,
            categories,
            layout: "layouts/mainLayout",
        });
    } catch (error) {
        console.error("Error fetching category:", error);

        req.flash("error", "Error fetching category.");
        return res.redirect("/");
    }
};

module.exports = {
    getHome,
    getContact,
    getRecipes,
    getRecipeDetails,
    getCategories,
};