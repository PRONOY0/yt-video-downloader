import React, { useEffect, useState } from "react";
import "../Home/home.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { MdDownload } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FormControl, Select, MenuItem } from "@mui/material";
import Loader from "../../components/loader/Loader";

const Video = () => {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState("");
  const [isNOTPremiumUser, setIsNOTPremiumUser] = useState(true);
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!link || !link.startsWith("http") || !quality) {
      toast.error("Please enter a valid URL and select a quality option.");
      return;
    }

    try {
      setLoading(true);

      // Send the request to download the video
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/video`,
        { link, quality },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Send token if available
          },
        }
      );

      if (response.data.success) {
        const { videoUrl, filename } = response.data;

        // Stream and download the video
        const videoResponse = await fetch(videoUrl);
        const videoBlob = await videoResponse.blob();

        const linkElement = document.createElement("a");
        linkElement.href = URL.createObjectURL(videoBlob);
        linkElement.download = filename;

        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);

        toast.success("The video was downloaded successfully!");

        // Trigger video deletion after download

        console.log(`filename is ${response.data.filename}`);
        await deleteVideo(response.data.filename);

        // Reset form
        setLink("");
        setQuality("");
      } else {
        toast.error(`Error: ${response.data.message}`);
      }
      setLoading(false);
    } catch (error) {
      toast.error("An error occurred while downloading the video.");
      setLoading(false);
      console.error(error);
    }
  };

  const deleteVideo = async (filename) => {
    try {
      const deleteResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/delete-video`,
        { filename },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (deleteResponse.data.success) {
        console.log("Video deleted successfully.");
      } else {
        console.error("Failed to delete video: ", deleteResponse.data.message);
      }
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  useEffect(() => {
    if (token) {
      setIsNOTPremiumUser(false);
    }
  }, [token]);

  return (
    <div className="home-container">
      {loading ? (
        <Loader />
      ) : (
        <>
          <h1>YouTube Video Downloader</h1>
          <p>Download online videos, convert online video to mp3 for free</p>
          <div className="input-field-quality-drop-down-container">
            <TextField
              id="outlined-basic"
              label="Paste your link here"
              variant="outlined"
              className="input-field"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <FormControl>
              <Select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
              >
                <MenuItem value={144}>144p (Low Quality)</MenuItem>
                <MenuItem value={240}>240p (Low Quality)</MenuItem>
                <MenuItem value={360}>360p (Standard Quality)</MenuItem>
                <MenuItem value={480}>480p (Standard Quality)</MenuItem>
                <MenuItem value={720}>720p (HD)</MenuItem>
                <MenuItem value={1080} disabled={isNOTPremiumUser}>
                  1080p
                </MenuItem>
                <MenuItem value={1440} disabled={isNOTPremiumUser}>
                  2K
                </MenuItem>
                <MenuItem value={2160} disabled={isNOTPremiumUser}>
                  4K
                </MenuItem>
                <MenuItem value={4320} disabled={isNOTPremiumUser}>
                  8K
                </MenuItem>
              </Select>
            </FormControl>
          </div>

          <Button
            variant="contained"
            type="submit"
            className="btn-submit"
            disabled={loading}
            onClick={handleSubmit}
            color="info"
          >
            {loading ? "Downloading..." : "Download"} <MdDownload />
          </Button>
        </>
      )}
    </div>
  );
};

export default Video;
