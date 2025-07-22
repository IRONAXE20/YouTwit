import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query

    const matchStage = {}
    if (query) matchStage.title = { $regex: query, $options: "i" }
    if (userId && isValidObjectId(userId)) matchStage.owner = new mongoose.Types.ObjectId(userId)

    const sortStage = {}
    sortStage[sortBy] = sortType === "asc" ? 1 : -1

    const aggregateQuery = Video.aggregate([
        { $match: matchStage },
        {            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        { $unwind: "$owner" },
        { $sort: sortStage }
    ])

    const options = {
        page: Number(page),
        limit: Number(limit)
    }

    const result = await Video.aggregatePaginate(aggregateQuery, options)
    return res.status(200).json(new ApiResponse(200, result))
})

const getUserVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({ owner: req.user._id }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, { docs: videos }, "User videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    const videoFile = req.files?.videoFile?.[0]
    const thumbnail = req.files?.thumbnail?.[0]

    if (!videoFile || !thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required")
    }

    const videoFileData = await uploadOnCloudinary(videoFile.path)
    const thumbnailData = await uploadOnCloudinary(thumbnail.path)

    if (!videoFileData?.url || !thumbnailData?.url) {
        throw new ApiError(400, "File upload failed")
    }

    const video = await Video.create({
        videofile: videoFileData.url,
        thumbnail: thumbnailData.url,
        title,
        description,
        duration: Math.floor(videoFileData.duration || 0),
        owner: req.user._id
    })

    return res.status(201).json(new ApiResponse(201, video, "Video uploaded successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId).populate("owner", "username fullName avatar")
    if (!video) throw new ApiError(404, "Video not found")

    return res.status(200).json(new ApiResponse(200, video))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    const thumbnailFile = req.file

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID")

    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video")
    }

    if (title) video.title = title
    if (description) video.description = description

    if (thumbnailFile) {
        const thumbnailData = await uploadOnCloudinary(thumbnailFile.path)
        if (!thumbnailData?.url) throw new ApiError(400, "Thumbnail upload failed")
        video.thumbnail = thumbnailData.url
    }

    await video.save()
    return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID")

    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video")
    }

    await video.deleteOne()
    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID")

    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "Video not found")
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update publish status")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res.status(200).json(new ApiResponse(200, video, `Video is now ${video.isPublished ? "published" : "unpublished"}`))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getUserVideos
} 
