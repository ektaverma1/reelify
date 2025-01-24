"use client";
import React, { useEffect, useState } from "react";
import { Heart, Share2, MessageCircle } from "lucide-react";

interface User {
  id: string;
  username: string | null;
  avatarUrl?: string;
}

interface Video {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  user?: User;
  createdAt: string;
}

interface VideoCardProps {
  video: Video;
}

const VideoCard = ({ video }: VideoCardProps) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="relative pb-[56.25%]">
      {" "}
      <video
        src={video.videoUrl}
        className="absolute top-0 left-0 w-full h-full object-cover"
        controls
        preload="metadata"
      />
    </div>
    <div className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{video.title}</h3>
          <p className="text-sm text-gray-500">
            {video.user?.username || "Anonymous"}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(video.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      {video.description && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {video.description}
        </p>
      )}
      <div className="mt-4 flex items-center space-x-4">
        <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
          <Heart className="w-5 h-5" />
          <span className="text-sm">0</span>
        </button>
        <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">0</span>
        </button>
        <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
);

const VideoFeed = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`/api/videos?page=${page}&limit=10`);
      if (!response.ok) throw new Error("Failed to fetch videos");
      const newVideos = await response.json();
      setHasMore(newVideos.length === 10);
      setVideos((prev) => [...prev, ...newVideos]);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [page]);

  return (
    <div className="grid gap-6 max-w-2xl mx-auto py-8">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      )}

      {!loading && videos.length === 0 && (
        <p className="text-center text-gray-500">No videos available</p>
      )}

      {hasMore && !loading && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="w-full py-2 px-4 text-sm font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default VideoFeed;
