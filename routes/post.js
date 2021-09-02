const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");

const Post = require("../models/Post");

//@route POST api/posts
// @desc Get post
// @access Private
router.get("/", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.userId }).populate("user", [
      "username",
    ]);
    res.json({ success: true, posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

//@route POST api/posts
// @desc Create post
// @access Private

router.post("/", verifyToken, async (req, res) => {
  const { title, description, url, status, user } = req.body;

  if (!title)
    return res
      .status(400)
      .json({ success: false, message: "Title is required" });

  try {
    const newPost = new Post({
      title,
      description,
      url: url.startsWith("https://") ? url : `https://${url}`,
      status: status || "TO LEARN",
      user: req.userId,
    });
    await newPost.save();

    res.json({ success: true, message: "Happy learning.", post: newPost });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

//@route POST api/posts
// @desc Update post
// @access Private
router.put("/:id", verifyToken, async (req, res) => {
  const { title, description, url, status, user } = req.body;

  if (!title)
    return res
      .status(400)
      .json({ success: false, message: "Title is required" });

  try {
    let updatePost = {
      title,
      description: description || "",
      url: url ? (url.startsWith("https://") ? url : `https://${url}`) : "",
      status: status || "TO LEARN",
    };

    const postUpdatePermission = { _id: req.params.id, user: req.userId };

    //  new: true khi update thành công sẽ thay bằng data mới còn nếu thất bại sẽ giữ lại data cũ
    updatePost = await Post.findOneAndUpdate(postUpdatePermission, updatePost, {
      new: true,
    });

    if (!updatePost)
      return res
        .status(401)
        .json({ success: false, message: "Post not found" });

    res.json({
      success: true,
      message: "Update successfully",
      post: updatePost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

//@route POST api/posts
// @desc Delete post
// @access Private
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const postDeleteCondition = { _id: req.params.id, user: req.userId };
    const deletePost = await Post.findOneAndDelete(postDeleteCondition);

    if (!deletePost)
      return res
        .status(401)
        .json({ success: false, message: "Post not found" });

    res.json({
      success: true,
      message: "Delete successfully",
      post: deletePost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

module.exports = router;
