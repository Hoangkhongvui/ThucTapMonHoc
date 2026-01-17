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
const chatbotController = require('./controllers/chatbotController');

router.get('/phone', homeController.printFirstUser);
router.get('/', homeController.index);

//login
router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/logout', userController.logout);
router.get('/session/status', userController.sessionStatus);
router.post('/user/update', userController.updateInfo);
router.post('/user/update-password', userController.updatePassword);

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
router.post('/cart/buy-now', cartController.buyNow);

router.get('/order/new', orderController.newOrder);
router.get('/order/:id', orderController.getOrder);
router.get('/orders/mine', orderController.getOrdersForCurrentUser);
router.patch('/order/:id/status', orderController.updateStatusOrder);
router.post('/order/create', orderController.createOrder);
router.post('/order/create-vnpay', orderController.createOrderVNPay);
router.get('/order-success', orderController.orderSuccess);

// Chatbot endpoint (simple proxy to controller service)
router.post('/chatbot', async (req, res) => {
	try {
		const message = req.body && req.body.message ? req.body.message : '';
		if (!message || message.trim().length === 0) return res.status(400).json({ error: 'Message is required' });

		const result = await chatbotController.recommendProducts(message);
		return res.json(result);
	} catch (err) {
		console.error('Chatbot route error:', err);
		return res.status(500).json({ error: 'Internal server error' });
	}
});

module.exports = router;
