const multer = require('multer');
const path = require('path');

/**
 * Upload Middleware
 * Xử lý việc upload file với multer
 */

// Cấu hình multer storage - Lưu vào memory để upload lên Cloudinary
const storage = multer.memoryStorage();

// File filter - Chỉ chấp nhận file ảnh
const fileFilter = (req, file, cb) => {
  // Kiểm tra loại file
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPEG, JPG, PNG, GIF, WebP)'));
  }
};

// Multer config
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
  },
  fileFilter: fileFilter,
});

/**
 * Middleware xử lý lỗi upload
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File quá lớn. Kích thước tối đa là 5MB',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: 'error',
        message: 'Quá nhiều file được upload',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: 'error',
        message: 'Trường file không hợp lệ',
      });
    }
    return res.status(400).json({
      status: 'error',
      message: err.message,
    });
  } else if (err) {
    // Other errors
    return res.status(400).json({
      status: 'error',
      message: err.message || 'Lỗi khi upload file',
    });
  }
  next();
};

/**
 * Upload single avatar
 */
const uploadAvatar = upload.single('avatar');

/**
 * Upload multiple images (max 5)
 */
const uploadImages = upload.array('images', 5);

module.exports = {
  upload,
  uploadAvatar,
  uploadImages,
  handleUploadError,
};
