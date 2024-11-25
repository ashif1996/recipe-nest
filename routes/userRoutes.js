const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authenticateJWT = require("../middlewares/jwtMiddleware");
const upload = require("../config/multerConfig");

router.route("/login")
    .get(userController.getUserLogin)
    .post(userController.userLogin);

router.route("/signup")
    .get(userController.getUserSignup)
    .post(userController.userSignup);

router.get('/logout', userController.userLogout);

router.get('/favourite-recipes', authenticateJWT, userController.getFavouriteRecipes);

router.route("/add-category")
    .get(authenticateJWT, userController.getAddCategory)
    .post(authenticateJWT, upload, userController.addCategory);

router.route("/add-recipe")
    .get(authenticateJWT, userController.getAddRecipe)
    .post(authenticateJWT, upload, userController.addRecipe);

module.exports = router;