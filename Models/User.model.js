const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Can't be blank"]
    },
    profile_icon: {
        type: String
    },
    userId: {
        type: String,
        required: [true, "Can't be blank"]
    },
    username: {
        type: String
    },
    over_18: {
        type: Boolean
    },
    created: { type: String },
    posts: []
}, { timestamps: true })

const UserModel = mongoose.model('User', UserSchema);

module.exports = { UserModel }