// backend/routes/upload.js
import express from "express";
import multer from "multer";
import path from "path";
import { handleUpload } from "../controllers/uploadController.js";

const router = express.Router();

// Storage en memoria
const storage = multer.memoryStorage();

// Validación del archivo
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  const allowedExt = [".xlsx"];
  const allowedMime = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ];

  if (allowedExt.includes(ext) && allowedMime.includes(mime)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos .xlsx"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter
});

router.post("/upload", upload.single("excelFile"), handleUpload);

export default router;



