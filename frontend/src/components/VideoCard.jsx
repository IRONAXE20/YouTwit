import React from "react";

const VideoCard = ({ video }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <img
        src={video.thumbnail}
        alt={video.title}
        className="rounded-lg mb-3 w-full h-40 object-cover"
      />
      <h3 className="text-lg font-semibold text-blue-700">{video.title}</h3>
      <p className="text-sm text-gray-600">{video.description}</p>
      <p className="text-xs text-gray-400 mt-1">Views: {video.views}</p>
    </div>
  );
};

export default VideoCard;
