import jwt from "jsonwebtoken";
import express from "express";

const app = express();
app.use(express.json());

const secretKey = `${process.env.SECRET_KEY}`;

// Function to generate a JWT token
export const generateToken = (payload) => {
  const token = jwt.sign(payload, secretKey, { expiresIn: "24h" });
  return token;
};

export const generateResetToken = (payload) => {
  const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
  return token;
};


export const verifyToken = (req, res, next) => {
  let token = req.headers["authorization"];
  token = token ? token.split(" ") : "";
  token = token[1] ? token[1] : "";
  if (!token) {
    return res
      .status(403)
      .json({ message: "Token not provided, You Need to Login First" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
};
