"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";


export default function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size too large");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("originalSize", file.size.toString());

    try {
      await axios.post("/api/video-upload", formData);

      toast.success("Video uploaded successfully", {
        duration: 3000,
        icon: "🎉",
        position: "top-right",
      });

      // Clear inputs for next upload
      setFile(null);
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error("Error uploading video", err);
      toast.error("❌ Failed to upload video");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Upload Your Video 🎥
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* File Input */}
          <label
            htmlFor="file"
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-700 hover:border-purple-500 transition-colors"
          >
            {file ? (
              <span className="text-white">{file.name}</span>
            ) : (
              <span className="text-gray-400">
                📂 Click to choose or drag & drop video
              </span>
            )}
            <input
              id="file"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          {/* Title */}
          <input
            type="text"
            placeholder="Enter video title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500/30 outline-none"
          />

          {/* Description */}
          <textarea
            placeholder="Write a short description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500/30 outline-none min-h-[100px]"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
          >
            {isUploading ? "Uploading..." : "🚀 Upload Video"}
          </button>
        </form>
      </div>
    </div>
  );
}
