import jwt from "jsonwebtoken";

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ success: false, message: "No Token, Authorization denied" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: "Access Denied" });
      }

      next();
    } catch (error) {
      console.log("JWT error", error.message);
      return res.status(401).json({ success: false, message: "Invalid Token" });
    }
  };
};

export default authMiddleware;
