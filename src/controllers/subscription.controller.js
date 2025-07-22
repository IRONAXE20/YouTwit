import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    const existing = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    if (existing) {
        await existing.deleteOne()
        return res.status(200).json(new ApiResponse(200, {}, "Unsubscribed successfully"))
    }

    await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    })

    return res.status(201).json(new ApiResponse(201, {}, "Subscribed successfully"))
})
const getSubscriberCount = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const count = await Subscription.countDocuments({ channel: channelId });

    return res.status(200).json(new ApiResponse(200, count, "Subscriber count fetched"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const subscribers = await Subscription.find({ channel: subscriberId })
        .populate("subscriber", "_id username fullName avatar")

    return res.status(200).json(new ApiResponse(200, subscribers))
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const channels = await Subscription.find({ subscriber: channelId })
        .populate("channel", "_id username fullName avatar")

    return res.status(200).json(new ApiResponse(200, channels))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
    getSubscriberCount
}
