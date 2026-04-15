// const mysql = require('mysql2/promise');
// require('dotenv').config();

// const pool = mysql.createPool({
//   host:     process.env.DB_HOST || 'localhost',
//   user:     process.env.DB_USER || 'cs307-user',
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME || 'comp307_booking',
//   waitForConnections: true,
//   connectionLimit: 10,
// });

// module.exports = pool;

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let db;

async function getDb() {
    if (!db) {
        db = await open({
            filename: path.join(__dirname, '../../data/booking.db'),
            driver: sqlite3.Database
        });
        await db.exec('PRAGMA foreign_keys = ON');
    }
    return db;
}

module.exports = getDb;