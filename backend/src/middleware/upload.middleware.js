// ✅ Purpose: Handle image uploads to Cloudinary
// Multer handles the file, Cloudinary stores it in the cloud

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const { CLOUDINARY } = require("../config/env");

// Step 1: Configure Cloudinary with our credentials
cloudinary.config({
  cloud_name: CLOUDINARY.cloud_name,
  api_key: CLOUDINARY.api_key,
  api_secret: CLOUDINARY.api_secret,
});

// Step 2: Tell multer to store files in Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "public-voice-issues", // folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      {
        width: 1200,
        height: 800,
        crop: "limit", // resize but don't stretch
        quality: "auto", // auto optimize quality
      },
    ],
  },
});

// Step 3: Create multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // max 5MB
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true); // accept file
    } else {
      cb(new Error("Only image files are allowed!"), false); // reject
    }
  },
});

module.exports = upload;