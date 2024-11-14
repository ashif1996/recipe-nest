const express = require('express');
const router = express.Router();

const indexController = require('../controllers/indexController');

router.get('/', indexController.getHome);
router.get('/contact', indexController.getContact);
router.get('/recipes', indexController.getRecipes);
router.get('/recipes/recipe-details', indexController.getRecipeDetails);

module.exports = router;