require("dotenv").config();

const express = require("express");

const app = express();

const port = process.env.PORT || 8000;

const { dbConnect } = require("./config/index");

const cors = require("cors");

const videoRouter = require("./router/video");

const userRouter = require("./router/index");

const path = require("path");

app.use(express.json());

app.use(cors());

app.use("/api/v1", videoRouter);
app.use("/api/v1", userRouter);
app.use("/downloads", express.static(path.join(__dirname, "downloads")));

app.get("/", (req, res) => {
  res.send(`<h1>App is running at PORT:${port}</h1>`);
});

app.listen(port, () => {
  console.log(`app is running at :${port}`);
});

dbConnect();
