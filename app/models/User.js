const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    fullname: String,
    phone: String,
    password: String,
    address: String,
    email: String,
    status: Number,
    join: Date,
    cart: Array,
    userType: {
        type: Number,
        enum: [0, 1], // 0: User, 1: Admin
        default: 0
    }
});

module.exports = mongoose.model("User", UserSchema);
