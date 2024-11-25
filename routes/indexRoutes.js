const express = require("express");
const router = express.Router();

const indexController = require("../controllers/indexController");

router.get("/", indexController.getHome);
router.get("/contact", indexController.getContact);

router.get("/categories", indexController.getCategories);
router.get("/recipes", indexController.getRecipes);
router.get("/recipes/:id", indexController.getRecipeDetails);

module.exports = router;