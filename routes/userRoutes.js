const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.get('/login', userController.getUserLogin);
router.post('/login', userController.userLogin);
router.get('/signup', userController.getUserSignup);
router.post('/signup', userController.userSignup);
router.get('/logout', userController.userLogout);
router.get('/favourite-recipes', userController.getFavouriteRecipes);
router.get("/add-recipe", userController.getAddRecipe);
router.get("/add-category", userController.getAddCategory);

module.exports = router;