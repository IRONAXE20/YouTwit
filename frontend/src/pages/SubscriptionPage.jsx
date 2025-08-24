// /src/pages/SubscriptionPage.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/AxiosInstance";

function SubscriptionPage() {
  const [channels, setChannels] = useState([]);
  const user = JSON.parse(localStorage.getItem("currentUser") || "null");

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        if (!user?._id) return;
        const res = await axiosInstance.get(`/subscriptions/c/${user._id}`);
        // backend returns array of Subscription docs populated with 'channel'
        const list = (res.data.data || []).map((s) => s.channel).filter(Boolean);
        setChannels(list);
      } catch (e) {
        console.error("Failed to load subscriptions", e);
      }
    };
    fetchSubs();
  }, [user?._id]);

  if (!user) return <div className="p-6">Please login</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Subscriptions</h2>
      {channels.length === 0 ? (
        <p className="text-gray-600">You haven’t subscribed to any channels yet.</p>
      ) : (
        <ul className="space-y-3">
          {channels.map((ch) => (
            <li key={ch._id} className="p-3 bg-white rounded shadow flex items-center space-x-3">
              <img
                src={ch.avatar || "/default-avatar.png"}
                alt={ch.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="font-semibold">{ch.fullName}</div>
                <div className="text-sm text-gray-500">@{ch.username}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SubscriptionPage;
