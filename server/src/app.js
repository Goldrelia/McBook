// Authors:
// Derek Long - 2616161918

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./config/db');
const app = express();
const port = process.env.PORT || 3000;


// Enabling CORS in backend to request resources from client + JSON parsing 
const cors = require('cors');
app.use(cors());
app.use(express.json())


// Adding API routes, connecting login from frontend to backend
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // Determine role based on email domain
    const role = email.endsWith('@mcgill.ca') ? 'owner' : 'student';

    // Check if user exists
    const [rows] = await pool.execute('SELECT id, password_hash FROM users WHERE email = ?', [email]);
    let userId;

    if (rows.length === 0) {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await pool.execute('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [email, hashedPassword, role]);
      userId = result.insertId;
    } else {
      // Verify password
      const isValid = await bcrypt.compare(password, rows[0].password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      userId = rows[0].id;
    }

    // Generate JWT
    const token = jwt.sign({ userId, role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });

    res.json({ token, role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
