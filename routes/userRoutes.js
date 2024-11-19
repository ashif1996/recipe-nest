const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authenticateJWT = require("../middlewares/jwtMiddleware");

router.route("/login")
    .get(userController.getUserLogin)
    .post(userController.userLogin);
router.route("/signup")
    .get(userController.getUserSignup)
    .post(userController.userSignup);
router.get('/logout', userController.userLogout);
router.get('/favourite-recipes', authenticateJWT, userController.getFavouriteRecipes);
router.get("/add-recipe", authenticateJWT, userController.getAddRecipe);
router.get("/add-category", authenticateJWT, userController.getAddCategory);

module.exports = router;