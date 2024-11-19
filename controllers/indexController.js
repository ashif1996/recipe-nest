const HttpStatuscode = require("../utils/httpStatusCode");

const getHome = (req, res) => {
    const locals = { title: "Home | RecipeNest" };
    return res.status(HttpStatuscode.OK).render("index", {
        locals,
        layout: "layouts/mainLayout",
    });
};

const getContact = (req, res) => {
    const locals = { title: "Contact Us | RecipeNest" };
    return res.status(HttpStatuscode.OK).render("contact", {
        locals,
        layout: "layouts/mainLayout",
    });
};

const getRecipes = (req, res) => {
    const locals = { title: "Recipes | RecipeNest" };
    return res.status(HttpStatuscode.OK).render("recipes", {
        locals,
        layout: "layouts/mainLayout",
    });
};

const getRecipeDetails = (req, res) => {
    const locals = { title: "Recipe Details | RecipeNest" };
    return res.status(HttpStatuscode.OK).render("recipeDetails", {
        locals,
        layout: "layouts/mainLayout",
    });
};

const getCategories = (req, res) => {
    const locals = { title: "Recipe Categories | RecipeNest" };
    return res.status(HttpStatuscode.OK).render("categories", {
        locals,
        layout: "layouts/mainLayout",
    });
};

module.exports = {
    getHome,
    getContact,
    getRecipes,
    getRecipeDetails,
    getCategories,
};