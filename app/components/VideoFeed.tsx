"use client";
import React, { useEffect, useState } from "react";
import { Heart, Share2, MessageCircle } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

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

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string | null;
    avatarUrl?: string;
  };
}

const VideoCard = ({ video }: VideoCardProps) => {
  const { userId } = useAuth();
  const [likes, setLikes] = useState<number>(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>("");

  const handleLike = async () => {
    try {
      await fetch(`/api/videos/${video.id}/likes`, { method: "POST" });
      setLikes((prev) => prev + 1);
      setIsLiked(true);
    } catch (error) {
      console.error("Error liking video:", error);
    }
  };

  const handleComment = async () => {
    try {
      const response = await fetch(`/api/videos/${video.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      const comment = await response.json();
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (error) {
      console.error("Error commenting:", error);
    }
  };

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
            <h3 className="text-lg font-semibold text-gray-900">
              {video.title}
            </h3>
            <p className="text-sm text-gray-500">{video.user?.username}</p>
          </div>
        </div>
        {video.description && (
          <p className="mt-2 text-sm text-gray-600">{video.description}</p>
        )}
        <div className="mt-4 flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 ${
              isLiked ? "text-red-500" : "text-gray-500"
            }`}
          >
            <Heart className="w-5 h-5" />
            <span className="text-sm">{likes}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 text-gray-500"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{comments.length}</span>
          </button>
        </div>

        {showComments && (
          <div className="mt-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Add a comment..."
            />
            <button
              onClick={handleComment}
              disabled={!newComment.trim()}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
            >
              Comment
            </button>
            <div className="mt-4 space-y-2">
              {comments.map((comment) => (
                <div key={comment.id} className="p-2 bg-gray-50 rounded">
                  <p className="text-sm font-medium">{comment.user.username}</p>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
