const express = require("express");
const isAuth = require("../middlewares/isAuthMiddleware")
const { registerController, loginController,logoutController } = require("../controllers/authController");
const authRouter = express.Router();

authRouter.post("/register" , registerController );

authRouter.post("/login", loginController);

authRouter.post("/logout", isAuth , logoutController);


module.exports = authRouter ;