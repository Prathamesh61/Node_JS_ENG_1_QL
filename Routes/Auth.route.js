const express = require("express");
const { user_controller } = require("../Controllers/User.controller");

const auth_route = express.Router();

auth_route.get("/reddit", user_controller.redditLogin);
auth_route.get("/reddit/callback", user_controller.redditCallback);

module.exports = { auth_route };