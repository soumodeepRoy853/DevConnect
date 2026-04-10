import {
  addCommentService,
  createPostService,
  deletePostService,
  getFeedPostsService,
  getPostsByUserService,
  toggleLikeService,
  repostService,
  unrepostService,
} from "../services/post.service.js";
import {
  validateCommentInput,
  validateCreatePostInput,
} from "../validators/post.validator.js";

//Create post
export const createPost = async (req, res) => {
  try {
    const payload = validateCreatePostInput(req.body);
    const post = await createPostService(req.user.id, payload, req.file);
    res.status(201).json({ post });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Server error" });
  }
};


//Get feed posts
export const getFeedPosts = async (req, res) => {
  try {
    const result = await getFeedPostsService(req.user.id, req.pagination);
    const response = { posts: result.posts };

    if (result.pagination) {
      response.pagination = result.pagination;
    }

    res.status(200).json(response);
  } catch (err) {
    const status = err.status || 500;
    res
      .status(status)
      .json({ message: err.message || "Server error while fetching feed." });
  }
};

//Get post by user
export const getPostsByUser = async (req, res) => {
  try {
    const result = await getPostsByUserService(req.params.userId, req.user.id, req.pagination);
    const response = { posts: result.posts };

    if (result.pagination) {
      response.pagination = result.pagination;
    }

    res.status(200).json(response);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Server error" });
  }
};

//Like/Unlike post
export const toggleLike = async (req, res) => {
  try {
    const { post, alreadyLiked } = await toggleLikeService(
      req.params.postId,
      req.user.id
    );

    res.status(200).json({ message: alreadyLiked ? "Unliked" : "Liked", post });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Server error" });
  }
};


//Add comment to post
export const addComment = async (req, res) => {
  try {
    const payload = validateCommentInput(req.body);
    const comments = await addCommentService(
      req.params.postId,
      req.user.id,
      payload
    );

    res
      .status(201)
      .json({ message: "Comment added successfully", comments });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Server error" });
  }
};

//Delete post
export const deletePost = async (req, res) => {
  try {
    await deletePostService(req.params.postId, req.user.id);
    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Server error" });
  }
};

//Repost a public post
export const repost = async (req, res) => {
  try {
    const post = await repostService(req.params.postId, req.user.id);
    res.status(201).json({ post });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Server error" });
  }
};

export const unrepost = async (req, res) => {
  try {
    const repostId = await unrepostService(req.params.postId, req.user.id);
    res.status(200).json({ repostId });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Server error" });
  }
};
