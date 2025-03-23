const express = require('express');
const router = express.Router();
const productController = require('./controllers/productController');
const adminController = require('./controllers/adminController');
const userController = require('./controllers/userController');
const homeController = require('./controllers/homeController');

router.get('/phone', homeController.printFirstUser);
router.get('/', homeController.index);

module.exports = router;