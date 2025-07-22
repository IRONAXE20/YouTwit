import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET CHANNEL STATS
const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Total videos uploaded by this user
  const totalVideos = await Video.countDocuments({ owner: userId });

  // 2. Total views across all videos
  const videos = await Video.find({ owner: userId }, "views");
  const totalViews = videos.reduce((sum, video) => sum + video.views, 0);

  // 3. Total subscribers
  const totalSubscribers = await Subscription.countDocuments({ channel: userId });

  // 4. Total likes on this user's videos
  const userVideoIds = videos.map((video) => video._id);
  const totalLikes = await Like.countDocuments({
    video: { $in: userVideoIds },
  });

  return res.status(200).json(
    new ApiResponse(200, {
      totalVideos,
      totalViews,
      totalSubscribers,
      totalLikes,
    }, "Channel stats fetched successfully")
  );
});

// GET ALL CHANNEL VIDEOS
const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const videos = await Video.find({ owner: userId }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, videos, "Channel videos fetched successfully")
  );
});

export {
  getChannelStats,
  getChannelVideos
};
