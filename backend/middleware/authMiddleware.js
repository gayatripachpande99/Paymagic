import jwt from "jsonwebtoken";
import { users } from "../data/store.js";

export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "paymagic_super_secret_jwt_key_2026");

      const user = users.find((u) => u.id === decoded.id || u.employeeId === decoded.employeeId);
      if (!user) {
        return res.status(401).json({ message: "Not authorized, user not found." });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error("Auth middleware verification failed:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed." });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided." });
  }
};
