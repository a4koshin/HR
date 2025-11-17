export const allowPage = (pageName) => (req, res, next) => {
  if (req.user.isSuperAdmin) return next(); // Super Admin bypass
  if (!req.userPermissions?.includes(pageName)) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  next();
};
