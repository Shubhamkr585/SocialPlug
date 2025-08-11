"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import VideoCard from "@/components/VideoCard";
import { Video } from "@/generated/prisma";
import { useUser, RedirectToSignIn } from "@clerk/nextjs";

function Home() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      const response = await axios.get("/api/videos");
      if (Array.isArray(response.data)) {
        setVideos(response.data);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error(error);
      setError("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      fetchVideos();
    }
  }, [isSignedIn, fetchVideos]);

  const handleDownload = useCallback((url: string, title: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title}.mp4`);
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // If Clerk is still loading user state
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // If not signed in, send to sign in page
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Welcome {user?.firstName || "User"}, here are your videos:
      </h1>
      {loading ? (
        <div>Loading videos...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : videos.length === 0 ? (
        <div className="text-center text-lg text-gray-500">
          No videos available
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
