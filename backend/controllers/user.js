const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    let expiryTime;

    // Check if all fields are present
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare entered password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Generate JWT token
    const payload = {
      userId: user._id,
      userEmail: user.email,
    };

    if (rememberMe === true) {
      expiryTime = "7d";
    } else {
      expiryTime = "1h";
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: expiryTime,
    });

    console.log(expiryTime);

    return res.status(200).json({
      success: true,
      token,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error("Login Error: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Signup Controller
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if all fields are present
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if the user already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = await User.create({ name, email, password: hashedPassword });

    // Remove password from the response object
    const responseUser = user.toObject();
    delete responseUser.password;

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: responseUser,
    });
  } catch (error) {
    console.error("Signup Error: ", error);
    return res.status(500).json({
      success: false,
      message: `Internal server error ${error}`,
    });
  }
};