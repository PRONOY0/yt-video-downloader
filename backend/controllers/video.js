const ytDlpwrap = require("yt-dlp-wrap").default;
const ytDlpWrap = new ytDlpwrap("../yt-dlp/yt-dlp.exe");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = "video-bucket-v1";

ffmpeg.setFfmpegPath(ffmpegPath);

exports.videoUrl = async (req, res) => {
  try {
    const { link, quality } = req.body;

    console.log("Request body:", req.body);

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

    if (!quality || !validQualities.includes(String(quality))) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing video quality",
      });
    }

    const qualityArg = `bestvideo[height<=${quality}]+bestaudio/best`;
    const downloadsDir = path.join(__dirname, "../downloads");

    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

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
          console.log(`Progress: ${progress.percent}%`)
        )
        .on("error", (error) => {
          console.error("Download error:", error);
          reject(new Error("Video download error"));
        })
        .on("close", resolve);
    });

    const downloadedFiles = fs.readdirSync(downloadsDir);
    const downloadedFile = downloadedFiles[downloadedFiles.length - 1];
    const filePath = path.join(downloadsDir, downloadedFile);
    const outputFilePath = path.join(
      downloadsDir,
      `${path.basename(downloadedFile, path.extname(downloadedFile))}.mp4`
    );

    console.log("File downloaded at:", filePath);

    if (!fs.existsSync(filePath)) {
      throw new Error("Downloaded file does not exist");
    }

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

    // Upload the MP4 file to S3
    const fileStream = fs.createReadStream(outputFilePath);
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: path.basename(outputFilePath), // The S3 key will be the filename
      Body: fileStream,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    // URL-encode the filename to handle spaces and special characters
    const encodedFilename = encodeURIComponent(path.basename(outputFilePath));
    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodedFilename}`;

    console.log(`filename is ${encodedFilename}`);
    console.log(`download the video from s3 using this url :- ${s3Url}`);

    res.json({
      success: true,
      message:
        "Video downloaded, converted to MP4, and uploaded to S3 successfully",
      videoUrl: s3Url,
      filename: path.basename(outputFilePath),
    });

    fs.unlinkSync(outputFilePath); // Delete the converted file after upload
  } catch (error) {
    console.error("Internal error:", error);
    return res.status(500).json({
      success: false,
      message: `Internal error: ${error.message}`,
    });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const { filename } = req.body;

    console.log(filename);

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "Missing filename for deletion",
      });
    }

    // Delete the file from S3
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: filename, // The S3 key is the filename
    };

    await s3.send(new DeleteObjectCommand(deleteParams));
    console.log(`File deleted from S3: ${filename}`);

    res.json({
      success: true,
      message: "Video successfully deleted from S3",
    });
  } catch (error) {
    console.error("Error deleting video from S3:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete the video from S3",
    });
  }
};
