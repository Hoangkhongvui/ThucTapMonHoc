const mongoose = require("mongoose");
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const VnpayConfig = require('../../config/vnpay');
// const moment = require("moment");
const moment = require("moment-timezone");
const crypto = require("crypto");

exports.newOrder = async (req, res) => {
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
      shippingFee: Order.SHIPPING_FEE,
      userId: user._id
    });

  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu cho form đặt hàng:", error);
    res.render('error', { message: 'Đã có lỗi xảy ra, vui lòng thử lại.' });
  }
}

exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Thiếu mã đơn hàng.' });
    }

    const order = await Order.findById(id)
      .populate('khachhang', 'fullname phone email address')
      .populate('products.productId', 'title price img')
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
    }

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin đơn hàng thành công.',
      order
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin đơn hàng:', error);
    res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi truy vấn đơn hàng.' });
  }
}

exports.updateStatusOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID đơn hàng không hợp lệ.'
      });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id, trangthai: 0 },
      { trangthai: 1 },
      { new: true }
    ).lean();

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng hoặc đơn hàng đã được xử lý trước đó.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công.',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi phía máy chủ.'
    });
  }
}

exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
      tenguoinhan,
      sdtnhan,
      diachinhan,
      ghichu,
      hinhthucgiao,
      thoigiangiao
    } = req.body;

    if (!userId || !tenguoinhan || !sdtnhan) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin người nhận hoặc userId."
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "UserId không hợp lệ." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ success: false, message: "Giỏ hàng trống." });
    }

    const productIds = user.cart.map(item => item.productId);
    const productsFromDB = await Product.find({ _id: { $in: productIds } });

    const productsForOrder = user.cart.map(item => {
      const product = productsFromDB.find(p => p._id.toString() === item.productId.toString());
      return {
        productId: product._id,
        title: product.title,
        quantity: item.quantity,
        price: product.price,
        note: item.note || ''
      };
    });

    const total = productsForOrder.reduce((sum, p) => sum + p.price * p.quantity, 0) + Order.SHIPPING_FEE;
    const orderId = "ORD" + Date.now();

    const order = new Order({
      id: orderId,
      khachhang: user._id,
      products: productsForOrder,
      tenguoinhan,
      sdtnhan,
      diachinhan: diachinhan || "",
      ghichu: ghichu || "",
      tongtien: total,
      hinhthucgiao: hinhthucgiao || "Giao tận nơi",
      thoigiangiao: thoigiangiao || "Giao ngay khi xong",
      trangthai: 0
    });

    await order.save();

    user.cart = [];
    await user.save();

    res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công!",
      order
    });

  } catch (error) {
    console.error("❌ Lỗi tạo đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo đơn hàng.",
      detail: error.message
    });
  }
};

exports.createOrderVNPay = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);

    const {
      sdtnhan,
      tennguoinhan,
      diachinhan,
      finalPrice,
      note,
    } = req.body;

    const productIds = user.cart.map(item => item.productId);
    const productsFromDB = await Product.find({ _id: { $in: productIds } });

    const productsForOrder = user.cart.map(item => {
      const product = productsFromDB.find(p => p._id.toString() === item.productId.toString());
      return {
        productId: product._id,
        title: product.title,
        quantity: item.quantity,
        price: product.price,
        note: item.note || ''
      };
    });

    const orderId = "ORD" + Date.now();
    const newOrder = new Order({
      id: orderId,
      khachhang: user.id,
      tongtien: finalPrice,
      products: productsForOrder,
      ghichu: note,
      tenguoinhan: tennguoinhan,
      sdtnhan: sdtnhan,
      diachinhan: diachinhan,
      phuongthucthanhtoan: "VNPAY"
    });


    await newOrder.save();

    let requestData = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: VnpayConfig.vnp_TmnCode,
      vnp_Amount: finalPrice * 100,
      vnp_CurrCode: "VND",
      vnp_TxnRef: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      vnp_OrderInfo: user._id,
      vnp_OrderType: "other",
      vnp_Locale: "vn",
      vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
      vnp_IpAddr: "127.0.0.1",
      vnp_ReturnUrl: VnpayConfig.vnp_ReturnUrl,
    };

    const secureHash = createSecureHash(requestData);
    requestData.vnp_SecureHash = secureHash;

    const paymentUrl = `${VnpayConfig.vnp_Url}?${Object.keys(requestData)
      .map((key) => `${key}=${encodeURIComponent(requestData[key])}`)
      .join("&")}`;
    return res.redirect(paymentUrl);

  } catch (error) {
    return res.status(500).send({
      message: "Lỗi khi tạo đơn hàng",
      error: error.message,
    });
  }
}

function createSecureHash(requestData) {
  const sortedParams = Object.keys(requestData)
    .sort()
    .reduce((result, key) => {
      result[key] = requestData[key];
      return result;
    }, {});

  const queryString = Object.keys(sortedParams)
    .map((key) => `${key}=${encodeURIComponent(sortedParams[key])}`)
    .join("&");

  const hmac = crypto.createHmac("sha512", VnpayConfig.vnp_HashSecret);
  return hmac.update(Buffer.from(queryString, "utf-8")).digest("hex");
}

exports.orderSuccess = async (req, res) => {
  const user = await User.findById(req.session.user.id);
  user.cart = [];
  await user.save();

  return res.render('orders/success');
}
