import {
  followUserService,
  getFollowDataService,
  unFollowUserService,
} from "../services/follow.service.js";

//Follow USer Controller
export const followUser = async (req, res) => {
  try {
    await followUserService(req.user.id, req.params.id);
    res.status(200).json({ message: "Followed successfully." });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Server error." });
  }
};

//Unfollow User Controller
export const unFollowUser = async (req, res) => {
  try {
  await unFollowUserService(req.user.id, req.params.id);
  res.status(200).json({ message: "Unfollowed successfully." });
  } catch (err) {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Server error." });
  }
}

//Get follow data Controller
export const getFollowData = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const data = await getFollowDataService(userId);
    res.status(200).json(data);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Server error." });
  }
}