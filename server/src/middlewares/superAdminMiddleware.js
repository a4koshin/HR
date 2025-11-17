export const protectSuperAdmin = (req, res, next) => {
    if (!req.user || !req.user.isSuperAdmin) {
      return res.status(403).json({ success: false, message: "Only Super Admin can access this" });
    }
    next();
  };
  