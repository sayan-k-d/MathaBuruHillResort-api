const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const imageUploadMiddleware = require("../middleware/imageUploadMiddleware");
const path = require("path");
// const storage = multer.memoryStorage();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage: storage });
const router = express.Router();

const adminController = require("../controllers/admin.controller");

router.post("/login", adminController.login);
router.get("/", authMiddleware, adminController.getCurrentUser);
router.put(
  "/edit",
  authMiddleware,
  imageUploadMiddleware.single("image"),
  adminController.editCurrentUser
);
router.get("/resetPassword", authMiddleware, adminController.getResetPassword);
router.post("/resetPassword/:token", adminController.postResetPassword);

// router.get("/verify/:token", adminController.verifyAdmin);

module.exports = router;
