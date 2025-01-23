"use client"
import React, { useEffect, useState } from 'react';
import { Heart, Share2, MessageCircle } from 'lucide-react';

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

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="aspect-w-16 aspect-h-9">
        <video
          src={video.videoUrl}
          className="object-cover w-full"
          controls
          preload="metadata"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{video.title}</h3>
            <p className="text-sm text-gray-500">{video.user?.username}</p>
          </div>
        </div>
        {video.description && (
          <p className="mt-2 text-sm text-gray-600">{video.description}</p>
        )}
        <div className="mt-4 flex items-center space-x-4">
          <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
            <Heart className="w-5 h-5" />
            <span className="text-sm">0</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">0</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const VideoFeed = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`/api/videos?page=${page}&limit=10`);
      if (!response.ok) throw new Error('Failed to fetch videos');
      const data = await response.json();
      setVideos(prev => [...prev, ...data]);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [page]);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="space-y-6">
        {loading && videos.length === 0 ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        ) : (
          <>
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
            {videos.length > 0 && (
              <button
                onClick={() => setPage(p => p + 1)}
                className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Load More
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VideoFeed;