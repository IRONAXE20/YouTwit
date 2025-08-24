// /src/pages/VideoPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/AxiosInstance";
import { FaThumbsUp } from "react-icons/fa";

function VideoPage() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [hasLiked, setHasLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [hasTracked, setHasTracked] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const user = JSON.parse(localStorage.getItem("currentUser") || "null");

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        // 1) video
        const videoRes = await axiosInstance.get(`/videos/${videoId}`);
        const videoData = videoRes.data.data;
        setVideo(videoData);

        // 2) comments
        const commentRes = await axiosInstance.get(`/comments/${videoId}`);
        setComments(commentRes.data.data.docs || []);

        // 3) liked? -> GET /likes/videos then check membership
        const likedVideosRes = await axiosInstance.get("/likes/videos");
        const likedVideos = likedVideosRes.data.data || [];
        setHasLiked(likedVideos.some((v) => v._id === videoId));

        // 4) subscribed? -> GET /subscriptions/c/:subscriberId (current user)
        if (user?._id) {
          const subsRes = await axiosInstance.get(`/subscriptions/c/${user._id}`);
          const subscribedChannels = subsRes.data.data || []; // {channel: {...}}
          setIsSubscribed(
            subscribedChannels.some((s) => s.channel?._id === videoData.owner._id)
          );
        } else {
          setIsSubscribed(false);
        }

        // 5) subscriber count
        const countRes = await axiosInstance.get(
          `/subscriptions/count/${videoData.owner._id}`
        );
        setSubscriberCount(countRes.data.data);
      } catch (error) {
        console.error("Error loading video data:", error);
      }
    };

    fetchVideoData();
  }, [videoId]); // single effect — no duplicates

  const handleWatchHistory = async () => {
    if (!hasTracked && video && user?._id) {
      try {
        // NOTE: your backend currently has only GET /users/history (no POST).
        // Keep this call if you add the POST route; otherwise comment out.
        await axiosInstance.post("/users/watch-history", { videoId: video._id });
        setHasTracked(true);
      } catch (error) {
        console.error("Failed to record watch history:", error);
      }
    }
  };

  const handleLike = async () => {
    try {
      await axiosInstance.post(`/likes/toggle/v/${video._id}`);
      setHasLiked((prev) => !prev);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleSubscribe = async () => {
    try {
      await axiosInstance.post(`/subscriptions/c/${video.owner._id}`);
      setIsSubscribed((prev) => !prev);
      setSubscriberCount((prev) => (isSubscribed ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("Error toggling subscription:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await axiosInstance.post(`/comments/${video._id}`, {
        content: newComment,
      });
      const newCmt = res.data.data;

      // populate with currentUser for immediate UI
      if (user) {
        newCmt.ownerDetails = {
          _id: user._id,
          fullName: user.fullName,
          username: user.username,
          avatar: user.avatar,
        };
      }

      setComments((prev) => [newCmt, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleCommentEdit = async (commentId) => {
    try {
      await axiosInstance.patch(`/comments/c/${commentId}`, {
        content: editingContent,
      });
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, content: editingContent } : c))
      );
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await axiosInstance.delete(`/comments/c/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  if (!video) {
    return <div className="p-8 text-center text-gray-600">Loading video...</div>;
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
        {/* Title + Channel Info */}
        <h2 className="text-2xl font-bold text-blue-700 mb-2">{video.title}</h2>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <img
              src={video.owner.avatar || "/default-avatar.png"}
              alt="channel-avatar"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-semibold text-gray-800">{video.owner.fullName}</p>
              <p className="text-sm text-gray-500">@{video.owner.username}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">{subscriberCount} subscribers</div>
        </div>

        {/* Video */}
        <video
          src={video.videofile}
          controls
          className="w-full rounded-lg mb-4"
          onPlay={handleWatchHistory}
        />

        {/* Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg ${
              hasLiked ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <FaThumbsUp />
            <span>{hasLiked ? "Liked" : "Like"}</span>
          </button>
          <button
            onClick={handleSubscribe}
            className={`px-4 py-2 rounded-lg text-white ${
              isSubscribed ? "bg-gray-500" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isSubscribed ? "Unsubscribe" : "Subscribe"}
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-6">{video.description}</p>

        {/* Comments */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-blue-700 mb-4">Comments</h3>

          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows="3"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Post Comment
            </button>
          </form>

          {comments.length === 0 ? (
            <p className="text-gray-500">No comments yet.</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((comment) => {
                const isOwner = comment.ownerDetails?._id === user?._id;
                return (
                  <li
                    key={comment._id}
                    className="bg-blue-100 p-3 rounded-xl text-gray-800 relative"
                  >
                    <p className="text-sm font-semibold mb-1">
                      {comment.ownerDetails?.fullName || "Anonymous"}
                    </p>
                    {editingCommentId === comment._id ? (
                      <>
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleCommentEdit(comment._id)}
                            className="bg-green-600 text-white px-3 py-1 rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditingContent("");
                            }}
                            className="bg-gray-400 text-white px-3 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm">{comment.content}</p>
                    )}
                    {isOwner && editingCommentId !== comment._id && (
                      <div className="absolute top-2 right-2 flex space-x-2 text-xs">
                        <button
                          onClick={() => {
                            setEditingCommentId(comment._id);
                            setEditingContent(comment.content);
                          }}
                          className="text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleCommentDelete(comment._id)}
                          className="text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoPage;
