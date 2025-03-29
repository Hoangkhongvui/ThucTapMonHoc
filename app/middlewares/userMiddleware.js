function checkAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    // req.flash('error', 'You do not have permission to access this page');
    res.redirect('/');
};

module.exports = {
    checkAdmin
};