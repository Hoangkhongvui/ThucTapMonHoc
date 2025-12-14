const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const mongoose = require("mongoose");

exports.index = async (req, res) => {
    try {
        const currentUser = req.session.user;
        const allProducts = await Product.find({ status: { $ne: 0 } }).sort({ id: -1 });
        const allUsers = await User.find();
        const allOrders = await Order.find().populate('khachhang', 'fullname')
                                .sort({ createdAt: -1 })
                                .lean();
        const totalUser = await User.countDocuments();
        const totalProduct = await Product.countDocuments({ status: { $ne: 0 } });
        const totalRevenue = allOrders.reduce((sum, order) => sum + order.tongtien, 0);
        const summaryAllOrder = await Order.aggregate([
            {
                $match: { trangthai: 1 }
            },
            {
                $facet: {
                    totalQuantity: [
                        { $unwind: "$products" },
                        {
                            $group: {
                                _id: null,
                                totalSold: { $sum: "$products.quantity" }
                            }
                        }
                    ],
                    totalRevenue: [
                        {
                            $group: {
                                _id: null,
                                totalMoney: { $sum: "$tongtien" }
                            }
                        }
                    ]
                }
            }
        ]);
        const soldByProduct = await Order.aggregate([
            { $match: { trangthai: 1 } },
            { $unwind: "$products" },
            {
                $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            {
                $group: {
                    _id: "$products.productId",
                    title: { $first: "$products.title" },
                    image: { $first: "$productInfo.img"},
                    category: { $first: "$productInfo.category"},
                    price: { $first: "$productInfo.price"},
                    totalSold: { $sum: "$products.quantity" },
                    totalMoney: {
                        $sum: {
                            $multiply: ["$products.quantity", "$products.price"]
                        }
                    }
                }
            },
            { $sort: { totalSold: -1 } }
        ]);

        res.render('admin/index', {
            currentUser,
            totalUser,
            totalProduct,
            totalRevenue,
            allProducts,
            allUsers,
            allOrders,
            totalSold: summaryAllOrder[0].totalQuantity[0]?.totalSold || 0,
            totalMoney: summaryAllOrder[0].totalRevenue[0]?.totalMoney || 0,
            soldByProduct
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error couting users and products');
    }
};

// User
exports.createUser = async (req, res) => {
    const { fullname, phone, password } = req.body;

    console.log(req.body);
    if (!fullname || !phone || !password) {
        req.flash('error', 'All fields are required!');
        return res.redirect('/admin');
    }

    try {
        const newUser = new User({ fullname, phone, password });
        await newUser.save();
        res.redirect('/admin');
    } catch (error) {
        console.error('Error creating user:', error);
        res.redirect('/admin');
    }
};

exports.getUser = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'Not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error', detail: err })
    }
}

exports.updateUser = async(req, res) => {
    const { userId, fullname, phone, password, userStatus } = req.body;

    if (!fullname || !phone || !password) {
        req.flash('error', 'All fields are required!');
        return res.redirect('/admin');
    }

    try {
        const user = await User.findById( userId );

        if (!user) {
            req.flash('error', 'User not found!');
            return res.redirect('/admin');
        }

        user.fullname = fullname;
        user.phone = phone;
        user.password = password;
        user.status = userStatus === 'on' ? 1 : 0;

        await user.save();

        res.redirect('/admin');
    } catch (error) {
        console.error('Error updating user:', error);
        res.redirect('/admin');
    }
}

exports.updateUserStatus = async(req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).send('user ID is required');
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('user not found');
        }

        user.status = 0;
        await user.save();

        res.redirect('/admin');
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).send('Server error');
    }
}

exports.getOrdersByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "productId không hợp lệ"
      });
    }

    const orders = await Order.aggregate([
      {
        $match: {
            trangthai: 1,
            "products.productId": new mongoose.Types.ObjectId(productId)
        }
      },
      { $unwind: "$products" },
      {
        $match: {
          "products.productId": new mongoose.Types.ObjectId(productId)
        }
      },
      {
        $project: {
          _id: 0,
          orderId: "$id",
          quantity: "$products.quantity",
          price: "$products.price",
          orderDate: "$thoigiandat"
        }
      },
      {
        $sort: { orderDate: -1 }
      }
    ]);

    return res.status(200).json({
      success: true,
      totalOrders: orders.length,
      data: orders
    });

  } catch (error) {
    console.error("Error getOrdersByProduct:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};
