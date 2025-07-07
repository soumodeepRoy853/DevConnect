import Post from "../models/Post.model.js";
import User from "../models/User.model.js";

//Create post
export const createPost = async (req, res) => {
  try {
    const { text, image } = req.body;
    const userId = req.user.id;

    const newPost = new Post({
      user: userId,
      text,
      image,
    });

    if (req.file) {
      newPost.image = `/uploads/posts/${req.file.filename}`;
    }

    const savedPost = await newPost.save();
    await savedPost.populate("user", ["name", "avatar"]);

    res.status(201).json({ post: savedPost });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


//Get feed posts
export const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentUser = await User.findById(userId).select("following");

    const feedUserIds = [...currentUser.following, userId]; // include self
    const posts = await Post.find({ user: { $in: feedUserIds } })
      .sort({ createdAt: -1 })
      .populate("user", ["name", "avatar" ]);

    res.status(200).json({ posts });
  } catch (err) {
    res.status(500).json({ message: "Server error while fetching feed." });
  }
};

//Get post by user
export const getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("user", ["name", "avatar"]);
    res.status(200).json({ posts });


  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

//Like/Unlike post
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate("user", "name avatar");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user.id;

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
      post.likeCount -= 1;
    } else {
      post.likes.push(userId);
      post.likeCount += 1;
    }

    await post.save();

    res.status(200).json({ message: alreadyLiked ? "Unliked" : "Liked", post });
  } catch (err) {
    console.error("Toggle like error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


//Add comment to post
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      console.log(req.params.postId);
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = {
      user: req.user.id,
      text,
    };
    post.comments.push(comment);
    await post.save();

    res.status(201).json({ message: "Comment added successfully", comments: post.comments });
;
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

//Delete post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post || post.user.toString() !== req.user.id) {
      // console.log(req.params.postId)
      return res.status(403).json({ message: "Unauthorized or not found!" });
    }

    await post.deleteOne();

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
