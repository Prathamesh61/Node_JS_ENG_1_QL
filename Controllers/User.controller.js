require("dotenv").config()
const axios = require('axios');
const querystring = require('querystring');
const { UserModel } = require("../Models/User.model");

const user_controller = {

    //login
    redditLogin: (req, res) => {
        const params = {
            client_id: process.env.CLIENT_ID,
            response_type: 'code',
            state: process.env.CLIENT_ID,
            redirect_uri: process.env.CALLBACK_URL,
            duration: 'permanent',
            scope: ['identity', 'edit', 'flair', 'history'].join(' ')
        };
        const url = 'https://www.reddit.com/api/v1/authorize' + '?' + querystring.stringify(params);
        res.redirect(url);
    },

    //callback after login
    redditCallback: async (req, res) => {
        const code = req.query.code;
        try {
            const data = {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: process.env.CALLBACK_URL
            };

            const headers = {
                'Authorization': `Basic ${Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            };

            //getting accesstoken here
            const response = await axios.post('https://www.reddit.com/api/v1/access_token', querystring.stringify(data), { headers });
            const accessToken = response.data.access_token;

            // getting details of user
            const apiResponse = await axios.get(`https://oauth.reddit.com/api/v1/me`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const userData = apiResponse.data;

            // getting posts of user
            const postsResponse = await axios.get(`https://oauth.reddit.com/user/${userData.name}/submitted`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            const posts = await postsResponse.data.data.children?.map((el) => {
                let post = {
                    postId: el.data.id,
                    title: el.data.title,
                    author: el.data.author,
                    totalComment: el.data.num_comments,
                    score: el.data.score,
                    body: el.data.selfText,
                    totalViews: el.data.view_count,
                    subReddit: el.data.subreddit,
                    images: el.data.preview.images,
                    postType: el.data.post_hint,
                    created: el.data.created
                }
                return post
            });

            //Check for existing user
            const user = await UserModel.findOne({ userId: userData.id });
            if (user) {
                res.status(404).send({
                    err: "User Already Registered",
                });
            } else {

                //save user to database
                let user = {
                    userId: userData.id,
                    name: userData.name,
                    username: userData.subreddit.display_name_prefixed,
                    over_18: userData.over_18,
                    created: userData.created,
                    profile_icon: userData.icon_img,
                    posts: posts
                };
                const new_user = new UserModel(user);
                await new_user.save();
            }
            res.send('Logged in successfully!');
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    },

    
    //get all users at once
    getUser: async (req, res) => {
        try {
            let users = await UserModel.find();
            res.send({ "msg": "User List", "users": users });
        } catch {
            res.send({ "err": "can't send data right now " });
        }
    },

    //get user with id by follwing route /user/:userId
    getUserById: async (req, res) => {
        try {
            let { userId } = req.params;
            // console.log(userId);
            let user = await UserModel.find({ userId: userId });
            res.status(200).send({ "user": user });
        } catch {
            res.status(500).send({ "err": "can't send data right now " });
        }
    },


    getPosts: async (req, res) => {
        try {
            let users = await UserModel.find();
            console.log(users.length)

            let posts = users.map((user) => user.posts);
            posts = [].concat(...posts);

            console.log(posts, "posts")
            res.status(200).send({ "posts": posts });
        } catch {
            res.status(500).send({ "err": "can't send data right now " });
        }
    },

    //get user with id by follwing route /user/posts/:userId
    getPostsByUserId: async (req, res) => {
        try {
            let { userId } = req.params;
            let user = await UserModel.findOne({ userId: userId });
            res.status(200).send({ "posts": user.posts });
            console.log(user.posts);
        } catch {
            res.status(500).send({ "err": "can't send data right now " });
        }
    },
}
module.exports = { user_controller }