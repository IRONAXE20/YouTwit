import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/AxiosInstance";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videoRes, tweetRes] = await Promise.all([
          axiosInstance.get("/videos/channel"),
          axiosInstance.get("/tweets/user-tweets"),
        ]);
        setVideos(videoRes.data.data.docs || []);
        setTweets(tweetRes.data.data || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    navigate("/"); // adjust if your login route is "/"
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">
            Welcome{user ? `, ${user.fullName}` : ""}!
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={user.avatar}
              alt="User Avatar"
              className="w-16 h-16 rounded-full object-cover border border-blue-300"
            />
            <div>
              <p className="text-lg font-semibold text-gray-700">@{user.username}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => navigate("/feed")}      
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            🏠 Go to Feed
          </button>
          <button
            onClick={() => navigate("/upload-video")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Upload Video
          </button>
          <button
            onClick={() => navigate("/new-tweet")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Create Tweet
          </button>
          <button
            onClick={() => navigate("/watch-history")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            📺 View Watch History
          </button>
        </div>

        {/* Main Dashboard Content */}
        {loading ? (
          <p className="text-center text-gray-500">Loading dashboard...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Videos */}
            <div className="bg-blue-100 p-4 rounded-xl shadow">
              <h2 className="text-xl font-semibold text-blue-700 mb-2">Your Videos</h2>
              {videos.length === 0 ? (
                <p className="text-sm text-gray-600">No videos uploaded yet.</p>
              ) : (
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {videos.map((video) => (
                    <li key={video._id}>
                      <button
                        onClick={() => navigate(`/video/${video._id}`)}  // <-- FIXED: plural
                        className="text-blue-600 hover:underline"
                      >
                        {video.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Tweets */}
            <div className="bg-blue-100 p-4 rounded-xl shadow">
              <h2 className="text-xl font-semibold text-blue-700 mb-2">Your Tweets</h2>
              {tweets.length === 0 ? (
                <p className="text-sm text-gray-600">No tweets yet.</p>
              ) : (
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {tweets.map((tweet) => (
                    <li key={tweet._id}>{tweet.content}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
