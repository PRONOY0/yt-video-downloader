const express = require("express");
const videoRouter = express.Router();

const { videoUrl, deleteVideo } = require("../controllers/video");

videoRouter.post("/video", videoUrl);
videoRouter.post("/delete-video", deleteVideo);

module.exports = videoRouter;
