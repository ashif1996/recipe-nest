const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController";)

router.get('/login', userController.getUserLogin);

module.exports = router;