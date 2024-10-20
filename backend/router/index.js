const express = require("express");
const userRouter = express.Router();

const { login, signup } = require("../controllers/user");

userRouter.post("/login", login);
userRouter.post("/Sign-Up", signup);

module.exports = userRouter;