// Simple Role-based Authentication & Session Simulation Middleware

function authenticateUser(req, res, next) {
  // Extract user info from headers or authorization
  const authRole = req.headers['x-user-role'] || 'Admin';
  const authUser = req.headers['x-user-name'] || 'Administrator';
  
  req.user = {
    role: authRole,
    name: authUser
  };
  next();
}

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
}

module.exports = {
  authenticateUser,
  requireRole
};
