import React, { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";

const ffmpeg = new FFmpeg();

const VideoTrimmer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [trimmedVideo, setTrimmedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);

  // Load FFmpeg
  const loadFFmpeg = async () => {
    if (!ffmpeg.loaded) {
      setLoading(true);
      await ffmpeg.load();
      setLoading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setTrimmedVideo(null);
    }
  };

  // Handle video trimming
  const handleTrim = async () => {
    if (!selectedFile) return;
  
    const start = parseFloat(startPoint);
    const end = parseFloat(endPoint);
  
    // Check if the input is valid
    if (isNaN(start) || isNaN(end) || start < 0 || end <= start) {
      alert("Please enter valid start and end points (e.g., 12.3, 15.6).");
      return;
    }
  
    setLoading(true);
    await loadFFmpeg();
  
    try {
      const inputFileName = "input.mp4";
      const outputFileName = "output.mp4";
  
      // Read file and write to FFmpeg's virtual filesystem
      const reader = new FileReader();
      reader.onload = async (e) => {
        const videoData = new Uint8Array(e.target.result);
        await ffmpeg.writeFile(inputFileName, videoData);
  
        // Trim the video with precise floating-point times
        await ffmpeg.exec([
          "-i",
          inputFileName,
          "-ss",
          start.toFixed(3), // Start time (with 3 decimal places)
          "-to",
          end.toFixed(3),   // End time (with 3 decimal places)
          "-c",
          "copy",
          outputFileName,
        ]);
  
        // Retrieve the output file
        const outputData = await ffmpeg.readFile(outputFileName);
        const videoURL = URL.createObjectURL(
          new Blob([outputData], { type: "video/mp4" })
        );
  
        setTrimmedVideo(videoURL);
      };
  
      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error("Error trimming the video:", error);
      alert("An error occurred while trimming the video.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-gray-100"
      style={{
        backgroundImage: 'url("https://sm.pcmag.com/pcmag_uk/gallery/t/the-best-o/the-best-online-video-editors-for-2024_ndqs.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="bg-white   bg-opacity-90 p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-6">
          🎬 Video <span className="text-indigo-500">Trimmer</span>
        </h1>

        <div className="space-y-4">
          {/* File Input */}
          <div>
            <label
              htmlFor="fileInput"
              className="block text-sm font-medium text-gray-700"
            >
              Select Video File:
            </label>
            <input
              type="file"
              id="fileInput"
              accept="video/*"
              onChange={handleFileChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
            {selectedFile && (
              <video
                ref={videoRef}
                controls
                src={URL.createObjectURL(selectedFile)}
                className="mt-4 w-full h-64 rounded-md shadow-sm"
              />
            )}
          </div>

          {/* Start and End Points */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startPoint"
                className="block text-sm font-medium text-gray-700"
              >
                ⏱ Start Point (in seconds):
              </label>
              <input
                type="number"
                id="startPoint"
                value={startPoint}
                onChange={(e) => setStartPoint(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="endPoint"
                className="block text-sm font-medium text-gray-700"
              >
                ⏲ End Point (in seconds):
              </label>
              <input
                type="number"
                id="endPoint"
                value={endPoint}
                onChange={(e) => setEndPoint(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Trim Button */}
          <button
            onClick={handleTrim}
            className={`w-full py-2 px-4 rounded-lg shadow-lg ${
              selectedFile
                ? "bg-indigo-500 text-white hover:bg-indigo-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!selectedFile || loading}
          >
            {loading ? "Processing..." : "✂️ Trim Video"}
          </button>
        </div>

        {/* Trimmed Video */}
        {trimmedVideo && (
          <div className="mt-6 text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Trimmed Video:
            </h2>
            <video
              controls
              src={trimmedVideo}
              className="w-full h-auto rounded-md shadow"
            />
            <div className="mt-4">
              <a
                href={trimmedVideo}
                download="trimmed_video.mp4"
                className="inline-block bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
              >
                ⬇️ Download Trimmed Video
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoTrimmer;
