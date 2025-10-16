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
    cart:[{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: { type: Number, default: 1 },
        note: { type: String, default: "" }
    }],
    userType: {
        type: Number,
        enum: [0, 1], // 0: User, 1: Admin
        default: 0
    }
});

// UserSchema.virtual('populatedCart', {
//     ref: 'Product',
//     localField: 'cart.productId',
//     foreignField: 'id',
// });

// UserSchema.set('toJSON', { virtuals: true });
// UserSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("User", UserSchema);
