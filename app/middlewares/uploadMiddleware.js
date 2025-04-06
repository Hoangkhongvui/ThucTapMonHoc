const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/assets/upload/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
  
const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extname && mimeType) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed!'));
        }
    }
});

module.exports = upload;






















// const multer = require('multer');
// const path = require('path');

// // Storage config
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, '../public/assets/upload'));
//   },
//   filename: function (req, file, cb) {
//     const ext = path.extname(file.originalname);
//     const filename = Date.now() + ext;
//     cb(null, filename);
//   }
// });

// // File filter (optional: restrict file types)
// const fileFilter = function (req, file, cb) {
//   if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//     cb(null, true);
//   } else {
//     cb(new Error('Only .jpg and .png files are allowed!'), false);
//   }
// };

// // Create upload middleware
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter
// });

// module.exports = upload;
