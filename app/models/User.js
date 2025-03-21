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
    userType: Number
});

module.exports = mongoose.model("User", UserSchema);
