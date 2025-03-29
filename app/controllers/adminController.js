const User = require('../models/User');
const Product = require('../models/Product');

exports.index = async (req, res) => {
    try {
        const user = req.session.user;
        const totalUser = await User.countDocuments();
        const totalProduct = await Product.countDocuments();
        res.render('admin/index', { 
            user,
            totalUser, 
            totalProduct 
        });
    } catch (error) {
        res.status(500).send('Error couting users and products');
    }
};
