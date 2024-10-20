import React, { useEffect, useState } from "react";
import "../Home/home.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { MdDownload } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FormControl, Select, MenuItem, Box } from "@mui/material";
import Loader from "../../components/loader/Loader";

const Video = () => {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState("");
  const [goDelete, setGoDelete] = useState(false);
  const token = localStorage.getItem("token");
  const [isNOTPremiumUser, setIsNOTPremiumUser] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!link || !link.startsWith("http") || !quality) {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/video`,
        { link, quality },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        const videoDownloadUrl = response.data.videoUrl;
        const filename = response.data.filename;

        // Stream video download
        const videoResponse = await fetch(videoDownloadUrl);
        const videoBlob = await videoResponse.blob();

        const linkElement = document.createElement("a");
        linkElement.href = URL.createObjectURL(videoBlob);
        linkElement.download = filename;

        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);

        toast.success("The video was downloaded successfully!");

        console.log("before", goDelete);
        setGoDelete(true);
        console.log("after", goDelete);

        setLink("");
        setQuality("");
      } else {
        toast.error(`Error: ${response.data.message}`);
      }
      setLoading(false);
    } catch (error) {
      toast.error("An error occurred while downloading the video.");
      setLink("");
      setQuality("");
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Inside the useEffect ", goDelete);

    if (goDelete) {
      axios
        .post(`${process.env.REACT_APP_API_URL}/api/v1/delete-video`, {
          goDelete: true,
        })
        .then((res) => console.log(res.data.message))
        .catch((err) => console.error(err));
    }
  }, [goDelete]);

  useEffect(() => {
    if (token) {
      setIsNOTPremiumUser(false);
    } else {
      setIsNOTPremiumUser(true);
    }
  }, []);

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
