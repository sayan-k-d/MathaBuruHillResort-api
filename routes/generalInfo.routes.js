const express = require("express");
const router = express.Router();
const generalInfoController = require("../controllers/generalInfo.controller");
const authMiddleware = require("../middleware/authMiddleware");
const imageUploadMiddleware = require("../middleware/imageUploadMiddleware");

/* GeneralInfo APIs */

router.get("/", generalInfoController.getAllGeneralInfo);
router.get("/services", authMiddleware, generalInfoController.getServices);
router.get("/gallery", authMiddleware, generalInfoController.getGalleryImages);
router.get("/packages", authMiddleware, generalInfoController.getPackages);

router.put("/edit", authMiddleware, generalInfoController.editGeneralInfo);

router.put(
  "/editBanner",
  authMiddleware,
  imageUploadMiddleware.fields([
    { name: "logo", maxCount: 1 },
    { name: "background", maxCount: 1 },
  ]),
  generalInfoController.editBannerImages
);
router.put(
  "/editAboutUs",
  authMiddleware,
  imageUploadMiddleware.single("image"),
  generalInfoController.editAboutUsImage
);
router.put(
  "/editQuote",
  authMiddleware,
  imageUploadMiddleware.single("background"),
  generalInfoController.editQuoteImage
);
router.put(
  "/editAmenities",
  authMiddleware,
  imageUploadMiddleware.single("background"),
  generalInfoController.editAmenitiesImage
);
router.put(
  "/editPackages",
  authMiddleware,
  imageUploadMiddleware.fields([
    { name: "icon", maxCount: 1 },
    { name: "images", maxCount: 10 },
    { name: "serviceIcons", maxCount: 10 },
  ]),
  generalInfoController.editPackageImages
);
router.put(
  "/editGallery",
  authMiddleware,
  imageUploadMiddleware.array("images"),
  generalInfoController.editGalleryImages
);

module.exports = router;
