const User = require('../models/User');
const Product = require('../models/Product');

exports.register = async (req, res) => {
    try {
        const products = await Product.find();
        const { fullname, phone, password, password_confirmation } = req.body;

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.render('home/index', { products, error: 'Phone is already registered', fullname });
        }

        if (password !== password_confirmation) {
            return res.render('home/index', { products, error: 'Passwords do not match', fullname });
        }

        const newUser = new User({
            fullname: fullname,
            phone: phone,
            password: password,
            address: "",
            email: "",
            status: 1,
            join: new Date(),
            cart: [],
            userType: 0,
        });

        await newUser.save();

        req.session.user = {
            id: newUser._id,
            fullname: newUser.fullname,
            phone: newUser.phone,
            role: newUser.userType == 0 ? "user" : "admin"
        };

        console.log(req.session.user);

        req.session.success = 'Registration successful! Please log in.';
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        const user = await User.findOne({ phone });
        if (!user) {
            return res.redirect('/');
        }

        if (password != user.password) {
            return res.redirect('/');
        }

        if (user.status === 0){
            return res.redirect('/');
        }

        req.session.user = {
            id: user._id,
            fullname: user.fullname,
            phone: user.phone,
            role: user.userType == 0 ? "user" : "admin"
        };

        return res.redirect('/');
    } catch (error) {
        res.status(500).send('Error logging in: ' + error.message);
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).send('Error logging out');
      }
      res.redirect('/');
    });
};
