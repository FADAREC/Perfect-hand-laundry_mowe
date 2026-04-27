import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "./storage";

export async function authenticate(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const user = await storage.getUser(payload.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // attach user ONCE for all routes
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
