const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { success } = require("concurrently/src/defaults");

const JWT_SECRET = "Hemantisagoodboy"; // This should be a secret key used to sign the JWT.

// ROUTE-1: Create a user using POST "/api/auth/createuser". Doesn't require Auth
router.post(
  "/createuser",
  [
    // Validate name, email, and password using express-validator
    body("name", "Enter a valid name").isLength({ min: 4 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be at least 5 characters long").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // If there are errors in validation, return bad request and the errors.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Check whether a user with the same email already exists.
    let existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "A user with this email already exists",
      });
    }

    try {
      // Generate a salt to hash the password
      const salt = await bcrypt.genSalt(10);
      // Hash the password using the generated salt
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      // Create a new user and save it to the database with the hashed password.
      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      });

      // Create a JWT token with the user ID and sign it with the secret key
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);

      // Return the JWT token in the response.
      res.json({ success: true, authtoken });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: "An error occurred while creating the user",
        message: err.message,
      });
    }
  }
);

// ROUTE-2 :- Authenticate a user using: POST "/api/auth/login". No login required
router.post("/login", async (req, res) => {
  let success = false;
  const { email, password } = req.body;

  try {
    // Find the user with the given email in the database.
    const user = await User.findOne({ email });
    if (!user) {
      success = false;
      return res.status(400).json({ success, error: "User not found" });
    }

    // Compare the provided password with the hashed password stored in the database.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      success = false;
      return res.status(400).json({ success, error: "Incorrect password" });
    }

    // Create a JWT token with the user ID and sign it with the secret key
    const data = {
      user: {
        id: user.id,
      },
    };
    const authtoken = jwt.sign(data, JWT_SECRET);

    // Return the JWT token in the response.
    success = true;
    res.json({ success, authtoken });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while authenticating the user",
      message: err.message,
    });
  }
});

// ROUTE-3 :- Get loggedin user details using: POST "/api/auth/getuser". Login required
router.post(
  "/getuser",
  require("../middleware/fetchuser"),
  async (req, res) => {
    try {
      // Find the user with the given ID in the database.
      const userId = req.user.id;
      let userData = await User.findById(userId, {
        password: 0,
      });
      if (!userData) {
        return res.status(400).json({ error: "User not found" });
      }
      res.json(userData);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "An error occurred while authenticating the user",
        message: err.message,
      });
    }
  }
);

module.exports = router;
