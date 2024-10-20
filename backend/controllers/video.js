const ytDlpwrap = require("yt-dlp-wrap").default;
const ytDlpWrap = new ytDlpwrap("../yt-dlp/yt-dlp.exe");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

exports.videoUrl = async (req, res) => {
  try {
    const { link, quality } = req.body;

    console.log("Request body:", req.body);

    // Validate URL
    if (!link || typeof link !== "string" || !link.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing video URL",
      });
    }

    const validQualities = [
      "144",
      "240",
      "360",
      "480",
      "720",
      "1080",
      "1440",
      "2160",
      "4320",
    ];

    // Validate quality
    if (!quality || !validQualities.includes(String(quality))) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing video quality",
      });
    }

    // Define the download format with the requested quality
    const qualityArg = `bestvideo[height<=${quality}]+bestaudio/best`;

    // folder to save the downloads
    const downloadsDir = path.join(__dirname, "../downloads");

    // Create the downloads directory if it doesn't exist
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    // Download the video using yt-dlp
    await new Promise((resolve, reject) => {
      ytDlpWrap
        .exec([
          link,
          "-f",
          qualityArg,
          "-o",
          `${downloadsDir}/%(title)s.%(ext)s`,
        ])
        .on("progress", (progress) =>
          console.log(
            `Progress: ${progress.percent}% of ${progress.totalSize} at ${progress.currentSpeed}, ETA: ${progress.eta}`
          )
        )
        .on("ytDlpEvent", (eventType, eventData) =>
          console.log(eventType, eventData)
        )
        .on("error", (error) => {
          console.error("Download error:", error);
          reject(new Error("Video download error"));
        })
        .on("close", resolve);
    });

    // Get the most recent downloaded file
    const downloadedFiles = fs.readdirSync(downloadsDir);
    const downloadedFile = downloadedFiles[downloadedFiles.length - 1];
    const filePath = path.join(downloadsDir, downloadedFile);
    const outputFilePath = path.join(
      downloadsDir,
      `${path.basename(downloadedFile, path.extname(downloadedFile))}.mp4`
    );

    console.log("File downloaded at:", filePath);

    // Check if the downloaded file exists
    if (!fs.existsSync(filePath)) {
      console.error("Downloaded file does not exist:", filePath);
      throw new Error("Downloaded file does not exist");
    }

    // Convert the video to MP4 using ffmpeg
    await new Promise((resolve, reject) => {
      console.log("Converting video:", filePath);

      ffmpeg(filePath)
        .toFormat("mp4")
        .outputOptions(["-c:v libx264", "-c:a aac", "-b:a 192k"])
        .save(outputFilePath)
        .on("end", () => {
          console.log("Conversion to MP4 complete");
          fs.unlinkSync(filePath); // Delete original file after conversion
          resolve();
        })
        .on("error", (error) => {
          console.error("FFmpeg error:", error);
          reject(new Error("Video conversion error"));
        });
    });

    // Construct the download URL for the MP4 file
    const fileUrl = `${req.protocol}://${req.get(
      "host"
    )}/downloads/${path.basename(outputFilePath)}`;

    // Send response
    res.json({
      success: true,
      message: "Video downloaded and converted to MP4 successfully",
      videoUrl: fileUrl,
      filename: path.basename(outputFilePath),
    });
  } catch (error) {
    console.error("Internal error:", error);
    return res.status(500).json({
      success: false,
      message: `Internal error: ${error.message}`,
    });
  }
};

exports.deleteVideo = (req, res) => {
  try {
    const { goDelete } = req.body;

    console.log(goDelete);

    const downloadsDir = path.join(__dirname, "../downloads");
    console.log(downloadsDir);

    const downloadedFiles = fs.readdirSync(downloadsDir);
    console.log(downloadedFiles);

    for (let i = 0; i < downloadedFiles.length; i++) {
      const directory = path.join(downloadsDir, downloadedFiles[i]);
      if (fs.existsSync(directory)) {
        fs.unlinkSync(directory);
        console.log(`Deleted file: ${downloadedFiles[i]}`);
      } else {
        console.error(`File not found: ${downloadedFiles[i]}`);
      }
    }

    res.json({
      success: true,
      message: "All files successfully deleted",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      status: 500,
      message:
        "Failed to delete the videos from downloads due to an internal error",
    });
  }
};
