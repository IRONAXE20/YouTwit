import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/AxiosInstance";
import { Link } from "react-router-dom";

function SubscriptionPage() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await axiosInstance.get("/subscriptions/subscribed-channels");
        setChannels(response.data.data || []);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">Subscribed Channels</h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : channels.length === 0 ? (
          <p className="text-gray-500">You have not subscribed to any channels yet.</p>
        ) : (
          <ul className="space-y-4">
            {channels.map((channel) => (
              <li key={channel._id} className="flex items-center space-x-4 p-4 bg-blue-100 rounded-xl shadow">
                <img
                  src={channel.avatar}
                  alt="Channel Avatar"
                  className="w-14 h-14 rounded-full object-cover border border-blue-300"
                />
                <div>
                  <p className="text-lg font-semibold text-blue-800">{channel.fullName}</p>
                  <p className="text-sm text-gray-600">@{channel.username}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SubscriptionPage;
