import { authMiddleware } from './auth.middleware.js';

export function adminMiddleware(req, res, next) {
  authMiddleware(req, res, (err) => {
    if (err) return;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin role required." });
    }
    next();
  });
}