const express = require('express');
const router = express.Router();
const userMiddleware = require('./middlewares/userMiddleware');
const upload = require('./middlewares/uploadMiddleware');
const productController = require('./controllers/productController');
const adminController = require('./controllers/adminController');
const userController = require('./controllers/userController');
const homeController = require('./controllers/homeController');
const cartController = require('./controllers/cartController');
const orderController = require('./controllers/orderController')

router.get('/phone', homeController.printFirstUser);
router.get('/', homeController.index);

//login
router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/logout', userController.logout);
router.get('/session/status', userController.sessionStatus);

//admin
router.get('/admin', userMiddleware.checkAdmin, adminController.index);
router.post('/admin/user/create', adminController.createUser);
router.get('/admin/user/:id', adminController.getUser);
router.post('/admin/user/update', adminController.updateUser);
router.post('/user/status', adminController.updateUserStatus);
router.get('/statistic/product/:productId', adminController.getOrdersByProduct);

router.post('/admin/product/create', upload.single('image'), productController.createProduct);
router.get('/admin/product/:id', productController.getProduct);
router.post('/admin/product/update', upload.single('image'), productController.updateProduct);
router.post('/product/status', productController.updateProductStatus);

router.get('/cart/:userId', cartController.loadCart);
router.post('/cart/add', cartController.addToCart);
router.post('/cart/remove', cartController.removeFromCart);

router.get('/order/new', orderController.newOrder);
router.get('/order/:id', orderController.getOrder);
router.patch('/order/:id/status', orderController.updateStatusOrder);
router.post('/order/create', orderController.createOrder);
router.post('/order/create-vnpay', orderController.createOrderVNPay);
router.get('/order-success', orderController.orderSuccess);

module.exports = router;
