require("express-async-errors");
const env = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");

/* routes */
const homeRoutes = require("./routes/home.routes.js");
const queriesRoutes = require("./routes/queries.routes.js");
const adminRoutes = require("./routes/admin.routes.js");
const userRoutes = require("./routes/users.routes.js");
const generalInfoRoutes = require("./routes/generalInfo.routes.js");

env.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/images", express.static(path.join(__dirname, "uploads")));
app.use(homeRoutes);
app.use("/api/queries", queriesRoutes);
app.use("/api/admin/queries", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/website", generalInfoRoutes);

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3001;
mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT);
    console.log("Mongo DB Connected:", PORT);
  })
  .catch((ex) => {
    console.log(ex);
  });
