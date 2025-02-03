"use client";
import React, {
  useEffect,
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
import { Heart, MessageCircle } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import _ from "lodash";

const RefreshContext = createContext<() => void>(() => {});

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
  const [watchTime, setWatchTime] = useState<number>(0);
  const [isUpdatingWatchTime, setIsUpdatingWatchTime] =
    useState<boolean>(false);
  const refreshFeed = useContext(RefreshContext);

  // Debounced function to update watch time
  const debouncedUpdateWatchTime = useCallback(
    _.debounce(async (currentTime: number) => {
      if (currentTime <= 5 || isUpdatingWatchTime) return;

      setIsUpdatingWatchTime(true);
      try {
        const response = await fetch(`/api/videos/${video.id}/watch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            watchTime: currentTime,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Trigger feed refresh after successful watch update
        refreshFeed();
      } catch (error) {
        console.error("Error updating watch time:", error);
      } finally {
        setIsUpdatingWatchTime(false);
      }
    }, 1000),
    [video.id, isUpdatingWatchTime, refreshFeed]
  );

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

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoElement = e.target as HTMLVideoElement;
    setWatchTime(videoElement.currentTime);

    if (videoElement.currentTime > 5) {
      fetch(`/api/videos/${video.id}/watch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          watchTime: videoElement.currentTime,
        }),
      }).catch((error) => console.error("Error updating watch time:", error));
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
          onTimeUpdate={handleTimeUpdate}
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
  const { userId } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<"recommended" | "latest">("recommended");
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const refreshFeed = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(
        `/api/videos?page=${page}&limit=10&sort=${sortBy}&userId=${userId}`
      );
      if (!response.ok) throw new Error("Failed to fetch videos");
      const newVideos = await response.json();
      setHasMore(newVideos.length === 10);
      setVideos((prev) => (page === 1 ? newVideos : [...prev, ...newVideos]));
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setVideos([]);
    fetchVideos();
  }, [sortBy, refreshTrigger]);

  return (
    <RefreshContext.Provider value={refreshFeed}>
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-6 flex justify-end">
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "recommended" | "latest")
            }
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="recommended">Recommended</option>
            <option value="latest">Latest</option>
          </select>
        </div>

        <div className="grid gap-6">
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
      </div>
    </RefreshContext.Provider>
  );
};

export default VideoFeed;
