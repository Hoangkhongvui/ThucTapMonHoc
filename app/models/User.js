const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    fullname: String,
    phone: String,
    password: String,
    address: String,
    email: String,
    status: {
        type: Number,
        enum: [0, 1], // 0: inactive, 1: active
        default: 1
    },
    join: {
        type: Date,
        default: Date.now
    },
    cart: Array,
    userType: {
        type: Number,
        enum: [0, 1], // 0: User, 1: Admin
        default: 0
    }
});

module.exports = mongoose.model("User", UserSchema);
