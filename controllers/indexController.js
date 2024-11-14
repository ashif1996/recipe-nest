const getHome = (req, res) => {
    const locals = { title: "Home | RecipeNest" };
    return res.status(200).render("index", {
        locals,
        layout: "layouts/mainLayout",
    });
};

const getContact = (req, res) => {
    const locals = { title: "Contact Us | RecipeNest" };
    return res.status(200).render("contact", {
        locals,
        layout: "layouts/mainLayout",
    });
};

const getRecipes = (req, res) => {
    const locals = { title: "Recipes | RecipeNest" };
    return res.status(200).render("recipes", {
        locals,
        layout: "layouts/mainLayout",
    });
};

const getRecipeDetails = (req, res) => {
    const locals = { title: "Recipe Details | RecipeNest" };
    return res.status(200).render("recipeDetails", {
        locals,
        layout: "layouts/mainLayout",
    });
};

module.exports = {
    getHome,
    getContact,
    getRecipes,
    getRecipeDetails,
};