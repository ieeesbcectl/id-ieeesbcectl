const Database = require('better-sqlite3');
const path = require('path');

// Connect to SQLite DB (creates file if it doesn't exist)
const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath, { verbose: console.log });

// Create members table
const initDb = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      photo TEXT,
      cloudinary_public_id TEXT,
      position TEXT,
      department TEXT,
      batch TEXT,
      socials TEXT -- Storing JSON string for social links
    );
  `;
  
  try {
    db.exec(createTableQuery);
    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

initDb();

module.exports = db;
