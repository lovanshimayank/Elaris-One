import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder =
      req.body.folder || "misc";

    const uploadPath = path.join(
      process.cwd(),
      "uploads",
      folder
    );

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, {
        recursive: true,
      });
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      file.originalname.replace(/\s+/g, "-");

    cb(null, uniqueName);
  },
});

const allowedTypes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

export const upload = multer({
  storage,

  limits: {
    fileSize: 20 * 1024 * 1024,
  },

  fileFilter(req, file, cb) {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Only PDF, JPG, JPEG and PNG files are allowed."
        )
      );
    }

    cb(null, true);
  },
});