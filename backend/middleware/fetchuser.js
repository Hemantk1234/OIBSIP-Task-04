const jwt = require("jsonwebtoken");
const JWT_SECRET = ""; // Your secret key for JWT

const fetchuser = (req, res, next) => {
  // Get the token from the request header
  const token = req.header("auth-token");

  // Check if the token is missing
  if (!token) {
    return res.status(401).json({ error: "Access denied. Token missing." });
  }

  try {
    // Verify the token and get the payload (user data)
    const data = jwt.verify(token, JWT_SECRET);

    // Set the user data in req.user
    req.user = data.user;
    next();
  } catch (error) {
    // If the token is invalid or expired, respond with a 401 error
    return res.status(401).json({ error: "Access denied. Invalid token." });
  }
};

module.exports = fetchuser;
