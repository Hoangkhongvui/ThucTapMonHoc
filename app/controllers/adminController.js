const User = require('../models/User');
const Product = require('../models/Product');

exports.index = async (req, res) => {
    try {
        const user = req.session.user;
        const totalUser = await User.countDocuments();
        const totalProduct = await Product.countDocuments({ status: { $ne: 0 } });
        // const allProducts = await Product.find().sort({ id: -1 });
        const allProducts = await Product.find({ status: { $ne: 0 } }).sort({ id: -1 });
        const allUsers = await User.find();
        res.render('admin/index', {
            user,
            totalUser,
            totalProduct,
            allProducts,
            allUsers
        });
    } catch (error) {
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
