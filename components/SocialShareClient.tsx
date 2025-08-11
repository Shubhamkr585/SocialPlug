"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { CldImage } from "next-cloudinary";

const socialFormats = {
  "Instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1", aspectClass: "aspect-square" },
  "Instagram Portrait (4:5)": { width: 1080, height: 1350, aspectRatio: "4:5", aspectClass: "aspect-[4/5]" },
  "Twitter Post (16:9)": { width: 1920, height: 1080, aspectRatio: "16:9", aspectClass: "aspect-[16/9]" },
  "Twitter Header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1", aspectClass: "aspect-[3/1]" },
  "Facebook Cover (205:78)": { width: 820, height: 312, aspectRatio: "205:78", aspectClass: "aspect-[205/78]" },
} as const;

type SocialFormatKey = keyof typeof socialFormats;

export default function SocialShareClient() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedPublicId, setUploadedPublicId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(""); // final transformed URL from img.currentSrc
  const [selectedFormat, setSelectedFormat] = useState<SocialFormatKey>("Instagram Square (1:1)");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [isTransforming, setIsTransforming] = useState(false);

  // when public id or format changes, show spinner until transformed image loads
  useEffect(() => {
    if (uploadedPublicId) {
      setIsTransforming(true);
      setImageUrl("");
    }
  }, [uploadedPublicId, selectedFormat]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);

    const fd = new FormData();
    fd.append("file", f);

    try {
      setIsUploading(true);
      setProgress(0);
      const res = await axios.post("/api/image-upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) => {
          if (p.total) {
            const pct = Math.round((p.loaded * 100) / p.total);
            setProgress(pct);
          }
        },
      });

      if (res.data?.public_id) {
        setUploadedPublicId(res.data.public_id);
        setImageUrl(res.data.secure_url || "");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) {
      alert("Preview not ready yet");
      return;
    }
    try {
      const resp = await fetch(imageUrl);
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedFormat.replace(/\s+/g, "_").toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("download error", err);
      alert("Download failed");
    }
  };

  const resetAll = () => {
    setFile(null);
    setUploadedPublicId(null);
    setImageUrl("");
    setProgress(0);
    setIsUploading(false);
    setIsTransforming(false);
  };

  const currentFormat = socialFormats[selectedFormat];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Social Media Image Creator</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Upload and options */}
          <div className="card bg-base-100 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">1. Upload</h2>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input file-input-bordered w-full"
              disabled={isUploading}
            />
            {isUploading && (
              <div className="mt-3">
                <progress
                  className="progress progress-primary w-full"
                  value={Math.min(Math.max(progress, 0), 100)}
                  max={100}
                />
                <div className="flex justify-between text-sm mt-1">
                  <span>{Math.round(progress)}%</span>
                  <span>{progress < 100 ? "Uploading..." : "Processing..."}</span>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3">2. Select Format</h2>
              <select
                className="select select-bordered w-full"
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value as SocialFormatKey)}
                disabled={!uploadedPublicId || isUploading}
              >
                {Object.keys(socialFormats).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <p className="text-sm mt-2 text-gray-400">
                {uploadedPublicId ? "Transforms are applied instantly when you change format." : "Upload an image to enable preview."}
              </p>
            </div>
          </div>

          {/* Right: Preview & download */}
          <div className="card bg-base-100 p-6 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">3. Preview & Download</h2>

            {!uploadedPublicId && !isUploading ? (
              <div className="w-full h-64 rounded-lg border border-dashed border-gray-700 flex items-center justify-center text-gray-400">
                Upload an image to see preview
              </div>
            ) : (
              <div className="w-full">
                <div className={`${currentFormat.aspectClass} w-full rounded-lg overflow-hidden bg-gray-900 relative`}>
                  {isTransforming && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/80"></div>
                    </div>
                  )}

                  {uploadedPublicId && (
                    <CldImage
                      key={`${uploadedPublicId}-${selectedFormat}`}
                      src={uploadedPublicId}
                      alt="preview"
                      width={currentFormat.width}
                      height={currentFormat.height}
                      crop="fill"
                      aspectRatio={currentFormat.aspectRatio}
                      gravity="auto"
                      className={`w-full h-full object-cover transition-opacity duration-300 ${isTransforming ? "opacity-0" : "opacity-100"}`}
                      onLoad={(e: any) => {
                        setImageUrl((e.target as HTMLImageElement).currentSrc || "");
                        setIsTransforming(false);
                      }}
                    />
                  )}
                </div>

                <div className="mt-4 flex gap-3">
                  <button className="btn btn-success" onClick={handleDownload} disabled={!imageUrl || isTransforming}>
                    Download Image
                  </button>
                  <button className="btn btn-ghost" onClick={resetAll}>
                    Upload Another
                  </button>
                </div>

                <p className="mt-3 text-sm text-gray-400">
                  Format: <span className="font-medium">{selectedFormat}</span> • {currentFormat.width}×{currentFormat.height}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

