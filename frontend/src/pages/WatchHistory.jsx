import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/AxiosInstance";
import { useNavigate } from "react-router-dom";

function WatchHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axiosInstance.get("/users/watch-history");
        setHistory(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch watch history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Your Watch History</h2>

        {loading ? (
          <p className="text-gray-500">Loading watch history...</p>
        ) : history.length === 0 ? (
          <p className="text-gray-500">You haven’t watched any videos yet.</p>
        ) : (
          <ul className="space-y-6">
            {history.map((video) => (
              <li
                key={video._id}
                className="flex flex-col sm:flex-row items-start sm:items-center bg-blue-100 rounded-lg p-4 shadow"
              >
                <video
                  className="w-full sm:w-64 rounded-md mb-3 sm:mb-0 sm:mr-4"
                  src={video.videofile}
                  controls
                />
                <div className="flex-1">
                  <h3
                    onClick={() => navigate(`/video/${video._id}`)}
                    className="text-lg font-semibold text-blue-800 cursor-pointer hover:underline"
                  >
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600">{video.description}</p>
                  <div className="flex items-center mt-2">
                    <img
                      src={video.owner.avatar || "/default-avatar.png"}
                      alt="channel-avatar"
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <p className="text-sm text-gray-700 font-medium">
                      {video.owner.fullName} (@{video.owner.username})
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default WatchHistory;
