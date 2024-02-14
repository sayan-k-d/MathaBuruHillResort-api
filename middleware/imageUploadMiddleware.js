const multer = require("multer");
//local uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     if (file.originalname.includes(" ")) {
//       const originalName = file.originalname.replace(/\s+/g, "_");
//       cb(null, originalName);
//     } else {
//       cb(null, file.originalname);
//     }
//   },
// });
// const upload = multer({ storage: storage });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
module.exports = upload;
