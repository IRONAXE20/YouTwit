import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/AxiosInstance";
import { useNavigate } from "react-router-dom";

function FeedPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setErr("");
        const res = await axiosInstance.get("/videos"); // backend: list all videos
        // handle both shapes: {data: {docs: []}} OR {data: []}
        const list =
          res?.data?.data?.docs ??
          res?.data?.data ??
          [];
        setVideos(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Failed to fetch videos:", e);
        setErr(
          e?.response?.data?.message || "Could not load videos. Check console."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Feed</h2>

        {loading && <p className="text-gray-500">Loading videos...</p>}
        {!loading && err && (
          <p className="text-red-600">Error: {err}</p>
        )}
        {!loading && !err && videos.length === 0 && (
          <p className="text-gray-500">No videos available.</p>
        )}

        {!loading && !err && videos.length > 0 && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                onClick={() => navigate(`/video/${video._id}`)}
              >
                <video
                  src={video.videofile}
                  className="w-full h-48 object-cover"
                  controls={false}
                  onMouseOver={(e) => e.target.play()}
                  onMouseOut={(e) => e.target.pause()}
                  muted
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {video.description}
                  </p>
                  <div className="flex items-center mt-3">
                    <img
                      src={video.owner?.avatar || "/default-avatar.png"}
                      alt="channel-avatar"
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <p className="text-sm text-gray-700 font-medium">
                      {video.owner?.fullName} (@{video.owner?.username})
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FeedPage;
