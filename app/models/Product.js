const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    id: Number,
    status: Number,
    title: String,
    img: String,
    category: String,
    price: Number,
    desc: String
});

module.exports = mongoose.model("Product", ProductSchema);
