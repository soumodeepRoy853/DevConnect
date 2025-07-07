import User from "../models/User.model.js";
import mongoose from "mongoose";

//Follow USer Controller
export const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (
      !mongoose.Types.ObjectId.isValid(targetUserId) ||
      !mongoose.Types.ObjectId.isValid(currentUserId)
    ) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    if (targetUserId === currentUserId) {
      return res
        .status(400)
        .json({ message: "You cannot follow yourself." });
    }

    const [targetUser, currentUser] = await Promise.all([
      User.findById(targetUserId),
      User.findById(currentUserId),
    ]);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const alreadyFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    if (alreadyFollowing) {
      return res.status(400).json({ message: "Already following." });
    }

    // Correct logic
    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId); 

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.status(200).json({ message: "Followed successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error." });
  }
};

//Unfollow User Controller
export const unFollowUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id;

        if(!mongoose.Types.ObjectId.isValid(targetUserId) || !mongoose.Types.ObjectId.isValid(currentUserId)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }

        //Prevent unfollowing yourself
        if(targetUserId === currentUserId) {
            return res.status(400).json({ message: "You cannot unfollow yourself." });
        }

        //Fetch both users in parallel
        const [targetUser, currentUser] = await Promise.all([
            User.findById(targetUserId),
            User.findById(currentUserId)
        ])

        if(!targetUser || !currentUser) {
            return res.status(404).json({ message: "User not found." });
        }

        //Check if already not following
        if(!currentUser.following.includes(targetUserId)) {
            return res.status(400).json({ message: "Not following this user." });
        }

        //Remove from following and followers
        currentUser.following = currentUser.following.filter(
            (id) => id.toString() !== targetUserId
        );
        targetUser.followers = targetUser.followers.filter(
            (id) => id.toString() !== currentUserId
        );

        await Promise.all([currentUser.save(), targetUser.save()]);

        res.status(200).json({ message: "Unfollowed successfully." });
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error." });
    }
}

//Get follow data Controller
export const getFollowData = async (req, res) => {
    try {
        if(!req.user || !req.user.id){
            // console.log(req.user.id)
            return res.status(401).json({ message: "Unauthorized access." });
        }
        const user = await User.findById(req.user.id)
        .populate("followers", "name email")
        .populate("following", "name email");

        if(!user) {
            return res.status(404).json({message: "User not found." });
        }

        res.status(200).json({
            followers: user.followers,
            following: user.following
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error." }); 
    }
}