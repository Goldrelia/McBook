// Authors:
// Derek Long - 2616161918
// Aurelia Bouliane - 261118164

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const pool = require('./config/db');
const app = express();
const port = process.env.PORT || 3000;

// Enabling CORS in backend to request resources from client + JSON parsing 
const cors = require('cors');
app.use(cors());
app.use(express.json());

// Import API routes
const apiRoutes = require('./routes/api');

// ==================== AUTHENTICATION ====================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // Determine role based on email domain
    const role = normalizedEmail.endsWith('@mcgill.ca') ? 'owner' : 'student';

    // Check if user exists
    const [rows] = await pool.execute('SELECT id, password_hash, role FROM users WHERE email = ?', [normalizedEmail]);
    let userId;
    let userRole;

    if (rows.length === 0) {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await pool.execute('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [normalizedEmail, hashedPassword, role]);
      userId = result.insertId;
      userRole = role;
    } else {
      // Verify password
      const isValid = await bcrypt.compare(password, rows[0].password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      userId = rows[0].id;
      userRole = rows[0].role;
    }

    // Generate JWT
    const token = jwt.sign({ userId, role: userRole, email: normalizedEmail }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });

    res.json({ token, role: userRole, userId, email: normalizedEmail });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mount all API routes
app.use('/api', apiRoutes);

// Serve built frontend in deployment (course server expects /home/cs307-user/app/index.html).
const staticCandidates = [
  process.env.STATIC_DIR,
  '/home/cs307-user/app',
  path.resolve(__dirname, '../../client/dist'),
].filter(Boolean);
const staticDir = staticCandidates.find((dir) => fs.existsSync(path.join(dir, 'index.html')));
if (staticDir) {
  app.use(express.static(staticDir));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
