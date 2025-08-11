
import React, { useState, useCallback } from "react";
import { getCldImageUrl, getCldVideoUrl } from "next-cloudinary";
import { Download, Clock, FileDown } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { filesize } from "filesize";

import { Video } from "../generated/prisma";


dayjs.extend(relativeTime);

interface VideoCardProps {
  video: Video;
  onDownload: (url: string, title: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const getThumbnailUrl = useCallback((publicId: string) => {
    return getCldImageUrl({
      src: publicId,
      width: 400,
      height: 225,
      crop: "fill",
      gravity: "auto",
      format: "jpg",
      quality: "auto",
      assetType: "video",
    });
  }, []);

  const getFullVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 1920,
      height: 1080,
    });
  }, []);

  const getPreviewVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 400,
      height: 225,
      rawTransformations: ["e_preview:duration_15:max_seg_9:min_seg_dur_1"],
    });
  }, []);

  const formatSize = useCallback((size: number) => {
    return filesize(size);
  }, []);

  const compressionPercentage = Math.round(
    (1 - Number(Number(video.compressedSize) / Number(video.originalSize))) * 100
  );

  const handlePreviewError = useCallback(() => {
    setPreviewError(true);
  }, []);

  return (
    <div
      className="card bg-base-100 shadow-xl hover:shadow-2xl 
        transition duration-300 ease-in-out overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <figure className="aspect-video relative">
        {isHovered ? (
          previewError ? (
            <div className="w-full h-full flex items-center justify-center">
              <h3 className="text-2xl font-bold">Preview not available</h3>
            </div>
          ) : (
            <video
              className="w-full h-full object-cover"
              src={getPreviewVideoUrl(video.publicId)}
              autoPlay
              muted
              loop
              onError={handlePreviewError}
            />
          )
        ) : (
          <img
            className="w-full h-full object-cover"
            src={getThumbnailUrl(video.publicId)}
            alt={video.title}
          />
        )}
      </figure>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2">
        <h2 className="text-lg font-bold">{video.title}</h2>
        <div className="flex items-center text-sm text-gray-500">
          <Clock size={16} className="mr-1" />
          Uploaded {dayjs(video.createdAt).fromNow()}
        </div>

        <div className="flex justify-between items-center text-sm mt-2">
          <div>
            <p>
              <span className="font-semibold">Original:</span>{" "}
              {formatSize(Number(video.originalSize))}
            </p>
            <p>
              <span className="font-semibold">Compressed:</span>{" "}
              {formatSize(Number(video.compressedSize))}
            </p>
          </div>
          <div className="text-green-500 font-bold">
            Compression: {compressionPercentage}%
          </div>
        </div>

        <button
          className="btn btn-primary w-full mt-3 flex items-center gap-2"
          onClick={() =>
            onDownload(getFullVideoUrl(video.publicId), video.title)
          }
        >
          <Download size={18} /> Download
        </button>
      </div>
    </div>
  );
};

export default VideoCard;
