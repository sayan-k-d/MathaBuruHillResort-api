const env = require("dotenv");
const jwt = require("jsonwebtoken");
env.config();

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  // const token = req.headers["x-access-token"];
  // const token = localStorage.getItem("x-access-token");
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

module.exports = verifyToken;
