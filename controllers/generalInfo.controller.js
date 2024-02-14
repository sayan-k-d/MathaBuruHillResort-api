const { GeneralInfo } = require("../models/GeneralInfo");
const imageUploadMiddleware = require("../middleware/imageUploadMiddleware");
const env = require("dotenv");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const getDataUri = require("../utils/dataUri");
env.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.getAllGeneralInfo = async (req, res, next) => {
  const generalInfo = await GeneralInfo.findOne({});
  res.send(generalInfo);
};

// exports.editGeneralInfo = imageUploadMiddleware.array("images");
exports.editGeneralInfo = async (req, res, next) => {
  try {
    let {
      nav,
      banner,
      aboutUs,
      amenities,
      quote,
      gallery,
      packages,
      location,
      contactUs,
      contacts,
    } = req.body;

    const generalInfo = await GeneralInfo.findOneAndUpdate(
      {},
      {
        $set: {
          nav,
          banner,
          aboutUs,
          amenities,
          quote,
          gallery,
          packages,
          location,
          contactUs,
          contacts,
        },
      },
      { new: true }
    );

    if (!generalInfo) {
      return res.status(404).json({ message: "GeneralInfo not found" });
    }
    res.status(200).json(generalInfo);
  } catch (error) {
    res.status(500).json({ message: "Server error" + error });
  }
};

exports.editBannerImages = async (req, res, next) => {
  try {
    const uploadedFiles = {};
    for (const fieldName of Object.keys(req.files)) {
      const file = req.files[fieldName][0];
      const fileUri = getDataUri(file);
      console.log(fileUri);
      const result = await cloudinary.uploader.upload(fileUri.content, {
        folder: "hotelImages",
      });

      console.log(result);
      uploadedFiles[fieldName] = result.secure_url;
    }
    console.log("uploadFiles", uploadedFiles);
    const generalInfo = await GeneralInfo.findOneAndUpdate(
      {},
      {
        $set: {
          "banner.logo": uploadedFiles.logo,
          "banner.background": uploadedFiles.background,
        },
      },
      { new: true }
    );
    if (!generalInfo) {
      return res
        .status(404)
        .json({ success: false, error: "Service not found" });
    }
    res.status(200).send(generalInfo);
  } catch (error) {
    res.send({ status: 500, error: "Server Error:" + error });
  }
};
exports.editAboutUsImage = async (req, res, next) => {
  try {
    const fileUri = getDataUri(req.file);
    const result = await cloudinary.uploader.upload(fileUri.content, {
      folder: "hotelImages",
    });
    const generalInfo = await GeneralInfo.findOneAndUpdate(
      {},
      {
        $set: {
          "aboutUs.image": result.secure_url,
        },
      },
      {
        new: true,
      }
    );

    res.status(200).send(generalInfo);
  } catch (error) {
    res.send({ status: 500, error: "Server Error:" + error });
  }
};

exports.editQuoteImage = async (req, res, next) => {
  try {
    const fileUri = getDataUri(req.file);
    const result = await cloudinary.uploader.upload(fileUri.content, {
      folder: "hotelImages",
    });
    const generalInfo = await GeneralInfo.findOneAndUpdate(
      {},
      {
        $set: {
          "quote.background": result.secure_url,
        },
      },
      {
        new: true,
      }
    );
    if (!generalInfo) {
      return res
        .status(404)
        .json({ success: false, error: "Service not found" });
    }
    res.status(200).send(generalInfo);
  } catch (error) {
    res.send({ status: 500, error: "Server Error:" + error });
  }
};

exports.editAmenitiesImage = async (req, res, next) => {
  try {
    const { service } = req.body;
    const fileUri = getDataUri(req.file);
    const result = await cloudinary.uploader.upload(fileUri.content, {
      folder: "hotelImages",
    });
    const generalInfo = await GeneralInfo.findOneAndUpdate(
      { "amenities.services.service": service },
      {
        $set: {
          "amenities.services.$.background": result.secure_url,
        },
      },
      { new: true }
    );
    if (!generalInfo) {
      return res
        .status(404)
        .json({ success: false, error: "Service not found" });
    }
    res.send(generalInfo);
  } catch (error) {
    res.status(500).send("Server Error: ", error);
  }
};

exports.editPackageImages = async (req, res) => {
  try {
    const { title } = req.body;

    const uploadedFiles = {};
    for (const fieldName of Object.keys(req.files)) {
      const file = req.files[fieldName];
      const urlArray = [];
      if (file && file.length > 0) {
        for (let uri of file) {
          const fileUri = getDataUri(uri);

          const result = await cloudinary.uploader.upload(fileUri.content, {
            folder: "hotelImages",
          });
          urlArray.push(result.secure_url);
        }
      }
      uploadedFiles[fieldName] = urlArray;
    }

    const generalInfo = await GeneralInfo.findOneAndUpdate(
      { "packages.rooms.title": title },
      {
        $set: {
          "packages.rooms.$.icon": uploadedFiles.icon[0],
          "packages.rooms.$.images": uploadedFiles.images.map((image) => image),
          "packages.rooms.$.serviceIcons": uploadedFiles.serviceIcons.map(
            (image) => image
          ),
        },
      },
      { new: true }
    );
    if (!generalInfo) {
      return res
        .status(404)
        .json({ success: false, error: "Package not found" });
    }
    res.send(generalInfo);
  } catch (error) {
    res.send(error);
  }
};

exports.editGalleryImages = async (req, res) => {
  try {
    const images = req.files;
    const uploadedFiles = [];
    for (const file of req.files) {
      const fileUri = getDataUri(file);
      const result = await cloudinary.uploader.upload(fileUri.content, {
        folder: "hotelImages",
      });
      uploadedFiles.push(result.secure_url);
    }
    console.log(images);
    const generalInfo = await GeneralInfo.findOneAndUpdate(
      {},
      {
        $set: {
          "gallery.images": uploadedFiles.map((image) => image),
        },
      },
      { new: true }
    );
    if (!generalInfo) {
      return res
        .status(404)
        .json({ success: false, error: "Package not found" });
    }
    res.send(generalInfo);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error: ", error);
  }
};

exports.getServices = async (req, res) => {
  try {
    const generalInfo = await GeneralInfo.findOne({});
    const services = generalInfo.amenities.services;
    res.status(200).send(services);
  } catch (error) {
    res.status(500).send("Server Error: ", error);
  }
};
exports.getGalleryImages = async (req, res) => {
  try {
    const generalInfo = await GeneralInfo.findOne({});
    const gallery = generalInfo.gallery.images;
    res.status(200).send(gallery);
  } catch (error) {
    res.status(500).send("Server Error: ", error);
  }
};
exports.getPackages = async (req, res) => {
  try {
    const generalInfo = await GeneralInfo.findOne({});
    const packages = generalInfo.packages;
    res.status(200).send(packages);
  } catch (error) {
    res.status(500).send("Server Error: ", error);
  }
};

/* Helper Functions */
const formatFileName = (fileName) => {
  let originalName;
  if (fileName.includes(" ")) {
    originalName = fileName.replace(/\s+/g, "_");
    return originalName;
  } else {
    return fileName;
  }
};
