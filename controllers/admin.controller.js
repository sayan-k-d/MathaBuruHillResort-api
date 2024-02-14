const { Queries } = require("../models/Queries");
const { Users, validate } = require("../models/Users");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const env = require("dotenv");
const crypto = require("crypto");
const multer = require("multer");
const { Dropbox } = require("dropbox");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const fs = require("fs");
env.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/*
  1. getAllQueries
  2. editQuery
  3. deleteQuery
  4. getQueryDetails
  5. login
  6. getCurrentUser
  7. editCurrentUser
  8. resetPassword
*/

// 1. getAllQueries
exports.getAllQueries = async (req, res, next) => {
  const queries = await Queries.find();
  res.send(queries);
};

// 2. editQuery
exports.editQuery = async (req, res) => {
  const queries = await Queries.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, email: req.body.email, query: req.body.query },
    { new: true }
  );
  if (!queries)
    return res.status(404).send("The Query with the Given ID is not found");
  res.send(queries);
};
// 3. deleteQuery
exports.deleteQuery = async (req, res) => {
  const query = await Queries.findByIdAndDelete(req.params.id);
  if (!query)
    return res.status(404).send("The query with the Given ID is not found");
  res.send(query);
};

// 4. getQueryDetails
exports.getQueryDetails = async (req, res) => {
  const query = await Queries.findById(req.params.id);
  if (!query)
    return res.status(404).send("The query with the Given ID is not found");
  res.send(query);
};

//5. login
exports.login = async (req, res) => {
  const { userName, password } = req.body;
  try {
    const user = await Users.findOne({ email: userName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = password === user.password ? true : false;
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    if (user.userType !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Forbidden: only admin users can access this route" });
    }
    const token = generateToken(user);
    // req.headers["x-access-token"] = token;
    res.cookie("token", token, { httpOnly: true });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//6. getCurrentUser
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send("Internal Server Error", error.message);
  }
};

//7. editCurrentUser
exports.editCurrentUser = async (req, res) => {
  try {
    // const dropbox = new Dropbox({
    //   accessToken: process.env.DROPBOX_ACCESS_TOKEN,
    // });
    const { name, email, mobile, dateOfBirth, gender, address } = req.body;
    const fileName = req.file ? req.file.originalname : undefined;
    const fileContent = req.file ? req.file.buffer : undefined;
    console.log(fileName, fileContent);
    // const folderPath = "/profilePicture";
    // const uploadedFile = await dropbox.filesUpload({
    //   path: `${folderPath}/${fileName}`,
    //   contents: fileContent,
    // });

    const user = await Users.findByIdAndUpdate(req.user.id, {
      $set: {
        profilePicture: fileName,
        name: name,
        email: email,
        mobile: mobile,
        dateOfBirth: dateOfBirth,
        gender: gender,
        address: address,
      },
    });
    if (user.profilePicture && user.profilePicture !== fileName) {
      if (fs.existsSync("uploads/" + user.profilePicture))
        fs.unlinkSync("uploads/" + user.profilePicture);
    }
    const updatedUser = await Users.findById(req.user.id);
    res.send({ status: 200, user: updatedUser });
  } catch (error) {
    res.send({ error: error });
  }
};

//8. resetPassword
exports.getResetPassword = async (req, res) => {
  try {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 3600000;
    await user.save();
    await sendPasswordResetEmail(user);
    res.send(user);
  } catch (error) {
    res.status(500).send("Internal Server Error", error.message);
  }
};

exports.postResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await Users.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    user.password = password;
    await user.save();
    res.cookie("token", "", { httpOnly: true });
    res.send(user);
  } catch (error) {
    res.status(500).send("Internal Server Error", error.message);
  }
};

// Generate a JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, userType: user.userType },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );
};

//password reset link
const sendPasswordResetEmail = async (user) => {
  const resetLink = `http://mbher-api.onrender.com/api/users/resetPassword/${user.resetToken}`;

  const mailOptions = {
    to: user.email,
    from: "sayankumar.d2000@gmail.com",
    subject: "Reset Password",
    html: `
    <h3><p>Hey,</p>
        <p>Looks like you forgot your password. Dont worry, here's the link to reset it : <strong><a href=${resetLink}>Reset Your Password</a></strong></p>
    </h3>
    `,
  };

  sgMail
    .send(mailOptions)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};

// //token generation
// const dropboxApi = require('dropbox-v2-api');

// // Replace with your Dropbox app credentials
// const APP_KEY = 'chird05tox6n2lf';
// const APP_SECRET = 's61oc6dcofybzuw';

// // Replace with your Dropbox app redirect URI
// const REDIRECT_URI = 'http://localhost:3001/api/users/login';

// // Sample user data (for demonstration purposes)
// const userData = {
//   accessToken: process.env.DROPBOX_ACCESS_TOKEN,
//   refreshToken: 'REFRESH_TOKEN',
//   expirationTime: Date.now() + 3600 * 1000, // One hour in the future
// };

// // Function to get a valid access token
// const getValidAccessToken = async () => {
//   // Check if the existing token is still valid
//   if (userData.expirationTime > Date.now()) {
//     return userData.accessToken;
//   } else {
//     // Token has expired, refresh it
//     const refreshedToken = await refreshToken(userData.refreshToken);
//     return refreshedToken;
//   }
// };

// // Function to refresh the access token
// const refreshToken = async (refreshToken) => {
//   const oauth2 = dropboxApi.OAuth2({
//     clientId: APP_KEY,
//     clientSecret: APP_SECRET,
//     redirectUri: REDIRECT_URI,
//   });

//   // Use the refresh token to obtain a new access token
//   const refreshedToken = await oauth2.refreshToken(refreshToken);

//   // Update user data with the new token and expiration time
//   userData.accessToken = refreshedToken.access_token;
//   userData.expirationTime = Date.now() + refreshedToken.expires_in * 1000;

//   return refreshedToken.access_token;
// };

// module.exports = { getValidAccessToken };

// exports.createAdmin = async (req, res) => {
//   const { error } = validate(req.body);
//   if (error) return res.status(400).send({ Error: error.details[0].message });
//   const {
//     name,
//     email,
//     mobile,
//     password,
//     dateOfBirth,
//     gender,
//     address,
//     userType,
//   } = req.body;
//   let user = await Users.findOne({ email: req.body.email });
//   if (user) return res.status(400).send("User Already Registered.");
//   const verificationToken = crypto.randomBytes(32).toString("hex");

//   user = new Users({
//     name: name,
//     email: email,
//     mobile: mobile,
//     password: password,
//     dateOfBirth: dateOfBirth,
//     gender: gender,
//     address: address,
//     userType: userType,
//     verificationToken: verificationToken,
//   });
//   let salt = await bcrypt.genSalt(10);
//   user.password = await bcrypt.hash(user.password, salt);

//   await user.save();

//   await sendVerificationEmail(user);

//   // const token = jwt.sign({ _id: user._id }, config.get("jwtPrivateKey"));
//   // const token = user.generateAuthToken();
//   res.send(
//     _.pick(user, [
//       "_id",
//       "name",
//       "email",
//       "mobile",
//       "dateOfBirth",
//       "gender",
//       "address",
//       "userType",
//     ])
//   );
//   // .header("x-auth-token", token)
// };

// exports.verifyAdmin = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const user = await Users.findOne({ verificationToken: token });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     user.verified = true;
//     user.verificationToken = undefined;
//     await user.save();
//     res.status(200).send("Admin Verified");
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// const sendVerificationEmail = async (user) => {
//   const verificationLink = `http://localhost:3001/api/users/verify/${user.verificationToken}`;

//   const mailOptions = {
//     to: user.email,
//     from: "sayankumar.d2000@gmail.com",
//     subject: "Verify Your Email",

//     html: `
//     <p><h2>New Admin Request</h2></p>
//     <p><strong>Name:</strong>${user.name}</p>
//     <p><strong>Email:</strong>${user.email}</p>
//     <p><strong>Mobile:</strong>${user.mobile}</p>
//     <p><strong>Gender:</strong>${user.gender}</p>
//     <p><strong>Address:</strong>${user.address}</p>
//     <p><h3>Click the following link to Confirm Admin Request:</h3> ${verificationLink}</p>
//     `,
//   };

//   sgMail
//     .send(mailOptions)
//     .then(() => {
//       console.log("Email sent");
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// };
