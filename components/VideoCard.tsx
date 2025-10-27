import React, { useState, useCallback } from "react";
import { getCldImageUrl, getCldVideoUrl } from "next-cloudinary";
import { Download, Clock } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {filesize} from "filesize";
import { Video } from "../generated/prisma";

dayjs.extend(relativeTime);

interface VideoCardProps {
  video: Video;
  onDownload: (url: string, title: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = (props) => {
  const { video, onDownload } = props;
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<boolean>(false);

  // NOTE: next-cloudinary may not ship types; we cast return to string to avoid implicit any
  const getThumbnailUrl = useCallback((publicId: string): string => {
    return getCldImageUrl({
      src: publicId,
      width: 400,
      height: 225,
      crop: "fill",
      gravity: "auto",
      format: "jpg",
      quality: "auto",
      assetType: "video",
    }) as string;
  }, []);

  const getFullVideoUrl = useCallback((publicId: string): string => {
    return getCldVideoUrl({
      src: publicId,
      width: 1920,
      height: 1080,
    }) as string;
  }, []);

  const getPreviewVideoUrl = useCallback((publicId: string): string => {
    return getCldVideoUrl({
      src: publicId,
      width: 400,
      height: 225,
      rawTransformations: ["e_preview:duration_15:max_seg_9:min_seg_dur_1"],
    }) as string;
  }, []);

  const formatSize = useCallback((size: number): string => {
    // 'filesize' may be untyped; casting result to string keeps TypeScript happy
    return String(filesize(size));
  }, []);

  // handle cases where Prisma fields might be string | bigint | number
  const originalSizeNum: number = Number((video.originalSize ?? 0) as unknown) || 0;
  const compressedSizeNum: number = Number((video.compressedSize ?? 0) as unknown) || 0;

  const compressionPercentage = originalSizeNum > 0
    ? Math.round((1 - compressedSizeNum / originalSizeNum) * 100)
    : 0;

  const handlePreviewError = useCallback(
    (_e?: React.SyntheticEvent<HTMLVideoElement>) => {
      setPreviewError(true);
    },
    []
  );

  return (
    <div
      className="card bg-base-100 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out overflow-hidden"
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
              {formatSize(originalSizeNum)}
            </p>
            <p>
              <span className="font-semibold">Compressed:</span>{" "}
              {formatSize(compressedSizeNum)}
            </p>
          </div>
          <div className="text-green-500 font-bold">
            Compression: {compressionPercentage}%
          </div>
        </div>

        <button
          className="btn btn-primary w-full mt-3 flex items-center gap-2"
          onClick={() =>
            onDownload(getFullVideoUrl(video.publicId), video.title ?? "download")
          }
        >
          <Download size={18} /> Download
        </button>
      </div>
    </div>
  );
};

export default React.memo(VideoCard);
