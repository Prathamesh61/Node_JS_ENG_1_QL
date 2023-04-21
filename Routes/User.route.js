const express = require("express");
const { user_controller } = require("../Controllers/User.controller");

const user_route = express.Router();

user_route.get("/user", user_controller.getUser);
user_route.get("/user/:userId", user_controller.getUserById);
user_route.get("/posts", user_controller.getPosts);
user_route.get("/posts/:userId", user_controller.getPostsByUserId);

module.exports = { user_route };