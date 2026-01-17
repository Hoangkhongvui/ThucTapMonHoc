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
            role: newUser.userType == 0 ? "user" : "admin",
            email: newUser.email || '',
            address: newUser.address || ''
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
        const products = await Product.find();

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
            role: user.userType == 0 ? "user" : "admin",
            email: user.email || '',
            address: user.address || ''
        };

        return res.render('home', {
            user: req.session.user,
            products: products,
        });
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

exports.sessionStatus = (req, res) => {
    if (req.session.user) {
        res.json({
            loggedIn: true,
            user: req.session.user
        });
    } else {
        res.json({
            loggedIn: false
        });
    }
};

// Update current user's information
exports.updateInfo = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.id) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const { fullname, email, address } = req.body;

        // basic validation
        if (!fullname || fullname.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Fullname is required' });
        }

        const user = await User.findById(req.session.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.fullname = fullname.trim();
        user.email = email ? email.trim() : user.email;
        user.address = address ? address.trim() : user.address;

        await user.save();

    // update session
    req.session.user.fullname = user.fullname;
    req.session.user.email = user.email || '';
    req.session.user.address = user.address || '';

        return res.json({ success: true, message: 'Cập nhật thông tin thành công', user: {
            id: user._id,
            fullname: user.fullname,
            phone: user.phone,
            email: user.email,
            address: user.address
        }});

    } catch (error) {
        console.error('Error updating user info:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Update current user's password
exports.updatePassword = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.id) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'Missing password fields' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'New password and confirmation do not match' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.session.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Note: passwords are stored in plaintext in this app. If you later add hashing, adjust this comparison.
        if (user.password !== currentPassword) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        // Optionally, you could refresh session or force re-login. We'll keep the user logged in.
        return res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
