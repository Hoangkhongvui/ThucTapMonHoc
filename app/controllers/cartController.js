const mongoose = require("mongoose");
const User = require('../models/User');
const Product = require('../models/Product');

exports.loadCart = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('cart.productId');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const totalQuantity = user.cart.reduce((total, item) => total + item.quantity, 0);
        res.status(200).json({ success: true, cart: user.cart, count: totalQuantity });
    } catch (error) {
        console.error('Error when load:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

exports.addToCart = async (req, res) => {
    const { userId, productId, quantity, note } = req.body;

    if (!userId || !productId) {
        return res.status(400).json({ success: false, message: 'Missing userId or productId information.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ success: false, message: 'Invalid user or product ID.' });
    }

    try {
        const [user, product] = await Promise.all([
            User.findById(userId),
            Product.findOne({ id: productId })
        ]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }
        const cartItemIndex = user.cart.findIndex(item =>
            item && item.productId && item.productId.toString() === productId
        );
        if (cartItemIndex > -1) {
            user.cart[cartItemIndex].quantity += quantity;
        } else {
            user.cart.push({ productId: product._id, title: product.title, quantity, note });
        }
        const updatedUser = await user.save();
        res.status(200).json({
            success: true,
            message: 'Product has been successfully added to cart.',
            cart: updatedUser.cart
        });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ success: false, message: 'Error adding product to cart.' });
    }
}

exports.removeFromCart = async (req, res) => {
    const { userId, productId, quantity } = req.body;
    const quantityToRemove = parseInt(quantity) || 1;

    if (!userId || !productId) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin userId hoặc productId.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'ID người dùng không hợp lệ.' });
    }

    try {
        const [user, product] = await Promise.all([
            User.findById(userId),
            Product.findOne({ id: productId })
        ]);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
        }
        if (!product) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
        }

        const cartItemIndex = user.cart.findIndex(item =>
            item && item.productId && item.productId.toString() === product._id.toString()
        );

        if (cartItemIndex === -1) {
            return res.status(404).json({ success: false, message: 'Sản phẩm này không có trong giỏ hàng.' });
        }

        const cartItem = user.cart[cartItemIndex];

        if (cartItem.quantity > quantityToRemove) {
            cartItem.quantity -= quantityToRemove;
        } else {
            user.cart.splice(cartItemIndex, 1);
        }

        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật giỏ hàng thành công.',
            cart: updatedUser.cart
        });

    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng.' });
    }
}
