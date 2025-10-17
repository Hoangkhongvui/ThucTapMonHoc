const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    khachhang: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        title: {
            type: String,
            default: ""
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        note: {
            type: String,
            required: false
        }
    }],
    tenguoinhan: {
        type: String,
        required: true
    },
    sdtnhan: {
        type: String,
        required: true
    },
    diachinhan: {
        type: String,
        required: false
    },
    ghichu: {
        type: String,
        default: ''
    },
    tongtien: {
        type: Number,
        required: true,
        default: 0
    },
    hinhthucgiao: {
        type: String,
        enum: ['Giao tận nơi', 'Nhận tại cửa hàng'],
        default: 'Giao tận nơi'
    },
    thoigiangiao: {
        type: String,
        default: 'Giao ngay khi xong'
    },
    ngaygiaohang: {
        type: Date,
        default: Date.now
    },
    trangthai: {
        type: Number,
        enum: [0, 1, 2], // Đang xử lý, Hoàn thành, Đang thanh toán
        default: 0
    },
    thoigiandat: {
        type: Date,
        default: Date.now
    },
    phuongthucthanhtoan: {
        type: String,
        enum: ["Tiền mặt", "VNPAY"],
        default: "Tiền mặt"
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', OrderSchema);

Order.SHIPPING_FEE = 30000;
module.exports = Order;
