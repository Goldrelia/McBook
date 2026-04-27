// Authors:
// Derek Long - 261161918
// Aurelia Bouliane - 261118164
// Authentication middleware for JWT verification

const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Middleware to verify JWT token and attach user info to request
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  });
}

/**
 * If Authorization is present, verify JWT and attach { userId, email, role } to req.user.
 * Does not fail when missing/invalid; only skips attaching user.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await pool.execute(
      'SELECT id, email, role FROM users WHERE id = ?',
      [decoded.userId]
    );
    if (rows.length) {
      req.user = {
        userId: rows[0].id,
        email: String(rows[0].email).trim().toLowerCase(),
        role: rows[0].role,
      };
    }
  } catch (e) {
    // no user
  }
  next();
}

/**
 * Middleware to check if user is an owner
 */
function requireOwner(req, res, next) {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Owner access required' });
  }
  next();
}

/**
 * Middleware to check if user is a student
 */
function requireStudent(req, res, next) {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Student access required' });
  }
  next();
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireOwner,
  requireStudent,
};
