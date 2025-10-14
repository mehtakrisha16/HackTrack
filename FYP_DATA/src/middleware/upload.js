const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename: userId-timestamp.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter
});

// Middleware to delete old profile photo
const deleteOldPhoto = async (req, res, next) => {
  try {
    if (req.user && req.user.profilePhoto) {
      const oldPhotoPath = path.join(__dirname, '../../uploads/profiles', path.basename(req.user.profilePhoto));
      
      // Check if file exists and delete it
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
        console.log('✅ Old profile photo deleted:', oldPhotoPath);
      }
    }
  } catch (error) {
    console.error('❌ Error deleting old photo:', error);
    // Don't block the upload if deletion fails
  }
  next();
};

module.exports = {
  upload,
  deleteOldPhoto
};
