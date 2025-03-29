const User = require('../models/User');
const Product = require('../models/Product');


exports.index = async (req, res) => {
    try {
        const user = req.session.user;
        const products = await Product.find();
        res.render('home/index', { user, products });
    } catch (error) {
        res.status(500).send('Error retrieving products');
    }
};

exports.printFirstUser = async (req, res) => {
    try {
        const firstUser = await User.findOne().sort({ _id: 1 });
        res.render('home/printFirstUser', { phone: firstUser ? firstUser.phone : 'No users found' });
    } catch (error) {
        res.status(500).send('Error retrieving user');
    }
};
