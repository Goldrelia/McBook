const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST || 'localhost',
  user:     process.env.DB_USER || 'cs307-user',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'comp307_booking',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;