// ✅ Purpose: Create a JWT token for a user
// JWT = 3 parts: Header.Payload.Signature
// Example: eyJhbG...eyJ1c2...SflKx...

const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/env");

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },       // payload — what we store inside token
    JWT_SECRET,           // secret key to sign it
    { expiresIn: JWT_EXPIRES_IN } // token expires in 7 days
  );
};

module.exports = generateToken;