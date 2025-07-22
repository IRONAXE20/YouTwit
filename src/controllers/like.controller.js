import mongoose from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { videoId } = req.params

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const existingLike = await Like.findOne({ video: videoId, likedBy: userId })

    if (existingLike) {
        await existingLike.deleteOne()
        return res.status(200).json(new ApiResponse(200, null, "Video unliked"))
    }

    await Like.create({ video: videoId, likedBy: userId })
    return res.status(200).json(new ApiResponse(200, null, "Video liked"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { commentId } = req.params

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId })

    if (existingLike) {
        await existingLike.deleteOne()
        return res.status(200).json(new ApiResponse(200, null, "Comment unliked"))
    }

    await Like.create({ comment: commentId, likedBy: userId })
    return res.status(200).json(new ApiResponse(200, null, "Comment liked"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { tweetId } = req.params

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId })

    if (existingLike) {
        await existingLike.deleteOne()
        return res.status(200).json(new ApiResponse(200, null, "Tweet unliked"))
    }

    await Like.create({ tweet: tweetId, likedBy: userId })
    return res.status(200).json(new ApiResponse(200, null, "Tweet liked"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const likedVideoDocs = await Like.find({ likedBy: userId, video: { $exists: true } })
        .populate("video")

    const likedVideos = likedVideoDocs.map(doc => doc.video)

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
