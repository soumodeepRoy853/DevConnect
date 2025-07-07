import Profile from "../models/Profile.model.js";
import User from "../models/User.model.js";

//Create or Update user profile
export const createAndUpdateProfile = async (req, res) => {
  try {
    const {
      bio,
      skills,
      github,
      linkedin,
      website,
      location,
      education,
      avatar,
    } = req.body;

    const profileFields = {
      user: req.user.id,
      bio,
      skills: skills ? skills.split(",").map((skill) => skill.trim()) : [],
      github,
      linkedin,
      website,
      location,
      education,
      avatar:
        avatar ||
        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
    };

    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileFields },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Profile saved successfully", profile });
  } catch (err) {
    // console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Get current user's profile
export const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "email"]
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ profile });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Get all profiles
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "email"]);

    res.status(200).json({ profiles });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//Get profile by user ID
export const getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.id }).populate(
      "user",
      ["name", "email"]
    );

    if (!profile) {
      console.log(profile);
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ profile });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//Delete User and Profile
export const deleteUserAndProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndDelete({ user: req.user.id });
    const user = await User.findByIdAndDelete(req.user.id);

    res.status(200).json({ message: "User and profile deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
