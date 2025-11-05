import multer from "multer";
import path from "path";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import firebaseConfig from "../config/Firebase.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firebaseStorage = getStorage(app);

// ใช้ memory storage
const storage = multer.memoryStorage();

// ตรวจสอบชนิดไฟล์
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif|webp/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

// multer middleware รับทุก field name
const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB
  fileFilter,
}).any(); // <- any() รับ field name อะไรก็ได้

// wrapper handle error ของ multer
const handleUpload = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// อัปโหลดไฟล์ไป Firebase
const uploadToFirebase = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  try {
    // อัปโหลดไฟล์ทั้งหมด ถ้ามีหลายไฟล์
    for (let file of req.files) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const storageRef = ref(firebaseStorage, `uploads/${fileName}`);
      const snapshot = await uploadBytesResumable(storageRef, file.buffer, {
        contentType: file.mimetype,
      });
      file.firebaseUrl = await getDownloadURL(snapshot.ref);
    }
    next();
  } catch (error) {
    console.error("Firebase upload error:", error);
    res.status(500).json({
      message: "Failed to upload image to Firebase",
      error: error.message,
    });
  }
};

export { handleUpload as upload, uploadToFirebase };
