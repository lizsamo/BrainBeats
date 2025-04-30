// middleware/auth.js

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");

  // If no token is provided
  if (!token) {
    return res.status(401).json({ success: false, message: "No token, authorization denied" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user data to request
    req.user = decoded.user;
    
    // Continue to the next middleware/function
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Token is not valid" });
  }
};