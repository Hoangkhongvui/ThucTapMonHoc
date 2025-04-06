const User = require('../models/User');
const Product = require('../models/Product');

exports.index = async (req, res) => {
    try {
        const user = req.session.user;
        const totalUser = await User.countDocuments();
        const totalProduct = await Product.countDocuments({ status: { $ne: 0 } });
        // const allProducts = await Product.find().sort({ id: -1 });
        const allProducts = await Product.find({ status: { $ne: 0 } });
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

exports.createProduct = async (req, res) => {
    const { name, description, price, category } = req.body;

    console.log(req.body);
    if (!name || !price || !category) {
        req.flash('error', 'All fields are required!');
        return res.redirect('/admin');
    }

    const image = req.file ? `upload/${req.file.filename}` : null;

    try {
        const maxP = await Product.findOne().sort({ id: -1 }).select('id').lean();
        console.log(maxP);
        const newProduct = new Product({ id: maxP.id + 1, title: name, desc: description, price, category, img: image, status: 1 });
        await newProduct.save();
        // req.flash('success', 'Product created successfully');
        res.redirect('/admin');
    } catch (error) {
        console.error('Error creating product:', error);
        res.redirect('/admin');
    }
};

exports.updateProduct = async (req, res) => {
    const { productId, name, description, price, category } = req.body;
    const image = req.file ? `upload/${req.file.filename}` : null;

    console.log(req.body);
    if (!name || !price || !category) {
        req.flash('error', 'All fields are required!');
        return res.redirect('/admin');
    }

    try {
        // Find the product by its ID
        const product = await Product.findOne({ id: productId });
        
        if (!product) {
            req.flash('error', 'Product not found!');
            return res.redirect('/admin');
        }

        // Update the product's fields
        product.title = name;
        product.desc = description;
        product.price = price;
        product.category = category;
        product.img = image || product.img;  // Keep existing image if no new one is uploaded
        product.status = product.status;  // Assuming the status remains unchanged

        // Save the updated product
        await product.save();

        res.redirect('/admin');
    } catch (error) {
        console.error('Error updating product:', error);
        res.redirect('/admin');
    }
};

exports.updateProductStatus = async (req, res) => {
    const { productId } = req.body;  // Get the product ID from the form

    if (!productId) {
        return res.status(400).send('Product ID is required');
    }

    try {
        const product = await Product.findOne({ id: productId });

        if (!product) {
            return res.status(404).send('Product not found');
        }

        product.status = 0;
        await product.save();

        res.redirect('/admin');
    } catch (error) {
        console.error('Error updating product status:', error);
        res.status(500).send('Server error');
    }
};



