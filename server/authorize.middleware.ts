import { Request, Response, NextFunction } from "express";
import { hasAccess } from "../shared/rbac";

export function authorize(minRole: string) {
  return (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!hasAccess(req.user.role, minRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}
