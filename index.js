const express = require('express');
const { connection } = require('./Config/db');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { user_route } = require('./Routes/User.route.js');
const { auth_route } = require('./Routes/Auth.route');

const PORT = process.env.PORT || 8080;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());


// The route to initiate the login process
app.get("/home", (req, res) => {
    res.send("Homepage")
})

app.use("/", user_route);
app.use("/auth", auth_route);

app.listen(process.env.PORT, async () => {
    try {
        await connection
        console.log("Connection to DB successfully")
    }
    catch (err) {
        console.log("Error connecting to DB")
    }
    console.log("Listening on PORT", PORT)
})