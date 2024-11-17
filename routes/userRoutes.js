const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.get('/login', userController.getUserLogin);
router.post('/login', userController.userLogin);
router.get('/signup', userController.getUserSignup);
router.post('/signup', userController.userSignup);

module.exports = router;