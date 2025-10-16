const mongoose = require("mongoose");
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

exports.newOrder = async(req, res) => {
   try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const userId = req.session.user.id;

        const user = await User.findById(userId)
            .populate('cart.productId')
            .lean();

        if (!user.cart || user.cart.length === 0) {
            return res.redirect('/cart?error=empty_cart');
        }

        const tongtien = user.cart.reduce((total, item) => {
            if (item.productId) {
                return total + (item.quantity * item.productId.price);
            }
            return total;
        }, 0);

        const userInfo = {
            fullname: user.fullname,
            phone: user.phone,
            address: user.address
        };

        res.render('orders/new', {
            userInfo: userInfo,
            cartItems: user.cart,
            totalPrice: tongtien,
            userId: user._id
        });

    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu cho form đặt hàng:", error);
        res.render('error', { message: 'Đã có lỗi xảy ra, vui lòng thử lại.' });
    }
}

exports.createOrder = async(req, res) => {

}
