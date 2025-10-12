const express = require('express');
const router = express.Router();
const userMiddleware = require('./middlewares/userMiddleware');
const upload = require('./middlewares/uploadMiddleware');
const productController = require('./controllers/productController');
const adminController = require('./controllers/adminController');
const userController = require('./controllers/userController');
const homeController = require('./controllers/homeController');

router.get('/phone', homeController.printFirstUser);
router.get('/', homeController.index);

//login
router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/logout', userController.logout);

//admin
router.get('/admin', userMiddleware.checkAdmin, adminController.index);
router.post('/admin/product/create', upload.single('image'), adminController.createProduct);
router.get('/admin/product/:id', adminController.getProduct);
router.post('/admin/product/update', upload.single('image'), adminController.updateProduct);
router.post('/product/status', adminController.updateProductStatus);

module.exports = router;