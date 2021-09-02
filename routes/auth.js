const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/auth");

const User = require("../models/Users");

// @route POST api/auth
// @desc Check if User is Logged
// @access Public
router.get("/", verifyToken, async (req, res) => {
  try {
    // Bỏ password - check user
    const user = await User.findById(req.userId).select("-password");
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

// @route POST api/auth/register
// @desc Register User
// @access Public
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing username or password!" });
  }

  // Tương tác vs DB nên thả vào try catch
  try {
    const user = await User.findOne({ username });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "Username already existed!" });
    }

    // Bảo mất password

    const hashedPassword = await argon2.hash(password);
    const newUser = new User({ username, password: hashedPassword });
    console.log(newUser);
    await newUser.save();

    // Mã hóa token
    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.json({
      success: true,
      message: "User created successfully",
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

// @route POST api/auth/login
// @desc Login user
// @access Public
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing username or password!" });
  }

  // Tương tác vs DB nên thả vào try catch
  try {
    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Username or password failed!" });

    const passwordValid = await argon2.verify(user.password, password);
    if (!passwordValid)
      return res
        .status(400)
        .json({ success: false, message: "Username or password failed!" });

    // Mã hóa token
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.json({
      success: true,
      message: "Login successfully!",
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

module.exports = router;
