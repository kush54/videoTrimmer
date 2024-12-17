
// export default UI;
import React, { useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";

const ffmpeg = new FFmpeg();

const VideoTrimmer = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [trimmedVideo, setTrimmedVideo] = useState(null);
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [loading, setLoading] = useState(false);

  // Load FFmpeg WASM
  const loadFFmpeg = async () => {
    if (!ffmpeg.loaded) {
      setLoading(true);
      await ffmpeg.load();
      setLoading(false);
    }
  };

  const handleTrim = async () => {
    if (!videoFile) {
      alert("Please select a video file first.");
      return;
    }

    const start = parseFloat(startPoint);
    const end = parseFloat(endPoint);

    if (isNaN(start) || isNaN(end) || start < 0 || end <= start) {
      alert("Invalid start or end points.");
      return;
    }

    setLoading(true);
    await loadFFmpeg();

    try {
      const inputFileName = "input.mp4";
      const outputFileName = "output.mp4";

      // Load video into FFmpeg's virtual filesystem
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        const videoData = new Uint8Array(e.target.result);

        await ffmpeg.writeFile(inputFileName, videoData);

        // Run FFmpeg command to trim the video
        await ffmpeg.exec([
          "-i",
          inputFileName,
          "-ss",
          start.toString(),
          "-to",
          end.toString(),
          "-c",
          "copy",
          outputFileName,
        ]);

        // Retrieve trimmed video
        const outputData = await ffmpeg.readFile(outputFileName);
        const videoURL = URL.createObjectURL(
          new Blob([outputData], { type: "video/mp4" })
        );

        setTrimmedVideo(videoURL);
      };

      fileReader.readAsArrayBuffer(videoFile);
    } catch (error) {
      console.error("Error trimming the video:", error);
      alert("An error occurred while trimming the video.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Video Trimmer</h1>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setVideoFile(e.target.files[0])}
      />
      <input
        type="text"
        placeholder="Start (in seconds)"
        value={startPoint}
        onChange={(e) => setStartPoint(e.target.value)}
      />
      <input
        type="text"
        placeholder="End (in seconds)"
        value={endPoint}
        onChange={(e) => setEndPoint(e.target.value)}
      />
      <button onClick={handleTrim} disabled={loading || !videoFile}>
        {loading ? "Processing..." : "Trim Video"}
      </button>

      {trimmedVideo && (
        <div>
          <h2>Trimmed Video:</h2>
          <video controls src={trimmedVideo} width="400" />
          <a href={trimmedVideo} download="trimmed_video.mp4">
            Download Trimmed Video
          </a>
        </div>
      )}
    </div>
  );
};

export default VideoTrimmer;
