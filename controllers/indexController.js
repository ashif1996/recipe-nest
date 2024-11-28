const Category = require("../models/categoryModel");
const Recipe = require("../models/recipeModel");

const HttpStatuscode = require("../utils/httpStatusCode");

// Render the home page with categories and recipes
const getHome = async (req, res) => {
    const locals = { title: "Home | RecipeNest" };

    try {
        const categories = await Category.find()
            .select("categoryName image description")
            .limit(3)
            .lean();

        const recipes = await Recipe.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryDetails",
                },
            },
            {
                $unwind: "$categoryDetails",
            },
            {
                $group: {
                    _id: "$category",
                    recipeId: { $first: "$_id" },
                    image: { $first: "$image" },
                    recipeName: { $first: "$recipeName" },
                    categoryName: { $first: "$categoryDetails.categoryName" },
                    preparationTime: { $first: "$preparationTime" },
                },
            },
            {
                $project: {
                    _id: 0,
                    recipeId: 1,
                    image: 1,
                    recipeName: 1,
                    categoryName: 1,
                    preparationTime: 1,
                },
            },
            {
                $limit: 3,
            },
        ]);

        return res.status(HttpStatuscode.OK).render("index", {
            locals,
            categories,
            recipes,
            layout: "layouts/mainLayout",
        });
    } catch (error) {
        console.error("Error fetching category:", error);

        req.flash("error", "Error fetching category.");
        return res.redirect(HttpStatuscode.INTERNAL_SERVER_ERROR, "/users/login");
    }
};

// Render the contact page
const getContact = (req, res) => {
    const locals = { title: "Contact Us | RecipeNest" };
    return res.status(HttpStatuscode.OK).render("contact", {
        locals,
        layout: "layouts/mainLayout",
    });
};

// Render the recipes page with filters and sorting
const getRecipes = async (req, res) => {
    const locals = { title: "Recipes | RecipeNest" };
    const { category, search, sort } = req.query;

    try {
        const categoryFilter = category?.trim() || null;
        const searchFilter = search?.trim() || null;
        const sortFilter = sort?.trim() || null;

        const page = parseInt(req.query.page) || 1;
        const limit = 9;

        const filter = {};

        if (categoryFilter) {
            filter.category = categoryFilter;
        }

        if (searchFilter) {
            filter.recipeName = { $regex: searchFilter, $options: "i" };
        }

        let sortOptions = {};
        
        switch (sortFilter) {
            case "A-Z":
                sortOptions = { recipeName: 1 };
                break;
            case "Z-A":
                sortOptions = { recipeName: -1 };
                break;
            case "newArrivals":
                sortOptions = { createdAt: -1 };
                break;
            case "preparationTime":
                sortOptions = { preparationTime: 1 };
                break;
            default:
                sortOptions = {};
        }

        let queryString = "";

        if (categoryFilter) {
            queryString += `&category=${categoryFilter}`;
        }
        
        if (searchFilter) {
            queryString += `&search=${searchFilter}`;
        }
        
        if (sortFilter) {
            queryString += `&sort=${sortFilter}`;
        }

        const categories = await Category.find()
            .select("_id categoryName")
            .lean();

        const recipes = await Recipe.find(filter)
            .select("recipeName image category preparationTime")
            .populate({
                path: "category",
                select: "categoryName",
            })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort(sortOptions)
            .lean();

        const totalRecipes = await Recipe.countDocuments(filter);
        const totalPages = Math.ceil(totalRecipes / limit);

        return res.status(HttpStatuscode.OK).render("recipes", {
            locals,
            categoryFilter,
            searchFilter,
            sortFilter,
            categories,
            recipes,
            currentPage: page,
            queryString,
            totalPages,
            layout: "layouts/mainLayout",
        });
    } catch (error) {
        console.error("Error fetching recipes:", error);

        req.flash("error", "Error fetching recipes.");
        return res.redirect(HttpStatuscode.INTERNAL_SERVER_ERROR, "/");
    }
};

// Render recipe details page along with similar recipes
const getRecipeDetails = async (req, res) => {
    const locals = { title: "Recipe Details | RecipeNest" };
    const { id } = req.params;

    try {
        const recipe = await Recipe.findById(id)
            .select("_id category recipeName image preparationTime servingSize ingredients steps")
            .populate({
                path: "category",
                select: "categoryName",
            })
            .lean();

        const similarRecipes = await Recipe.find({ category: recipe.category })
            .select("_id category recipeName image preparationTime")
            .populate({
                path: "category",
                select: "categoryName",
            })
            .limit(3)
            .lean();

        return res.status(HttpStatuscode.OK).render("recipeDetails", {
            locals,
            recipe,
            similarRecipes,
            layout: "layouts/mainLayout",
        });
    } catch (error) {
        console.error("Error fetching recipe details:", error);

        req.flash("error", "Error fetching recipe details.");
        return res.redirect(HttpStatuscode.INTERNAL_SERVER_ERROR, "/");
    }
};

// Render all recipe categories
const getCategories = async (req, res) => {
    const locals = { title: "Recipe Categories | RecipeNest" };

    try {
        const categories = await Category.find()
            .select("categoryName image description")
            .lean();

        return res.status(HttpStatuscode.OK).render("categories", {
            locals,
            categories,
            layout: "layouts/mainLayout",
        });
    } catch (error) {
        console.error("Error fetching category:", error);

        req.flash("error", "Error fetching category.");
        return res.redirect(HttpStatuscode.INTERNAL_SERVER_ERROR, "/");
    }
};

module.exports = {
    getHome,
    getContact,
    getRecipes,
    getRecipeDetails,
    getCategories,
};