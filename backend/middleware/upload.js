const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Function to create directory if it doesn't exist
const createDirIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// Initialize directories
const uploadDirs = ["uploads/covers", "uploads/books"];
uploadDirs.forEach(dir => createDirIfNotExists(dir));

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "";
    
    // Determine destination based on field name
    if (file.fieldname === 'coverImages') {
      uploadPath = "uploads/covers/";
    } else if (file.fieldname === 'bookFile') {
      uploadPath = "uploads/books/";
    } else {
      uploadPath = "uploads/others/";
      createDirIfNotExists(uploadPath);
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Sanitize filename and add timestamp
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
    cb(null, Date.now() + "-" + originalName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'coverImages') {
    // Allow only images for coverImages
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for cover images'), false);
    }
  } else if (file.fieldname === 'bookFile') {
    // Allow only specific document types for bookFile
    const allowed = [
      "application/pdf", 
      "text/plain", 
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed for book files'), false);
    }
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Export the configured upload middleware
exports.uploadFiles = upload.fields([
  { name: 'coverImages', maxCount: 5 },
  { name: 'bookFile', maxCount: 1 }
]);

// Export directory creation function for use elsewhere
exports.initializeUploadDirs = () => {
  uploadDirs.forEach(dir => createDirIfNotExists(dir));
};