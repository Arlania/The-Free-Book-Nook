const Database = require("better-sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "database", "freebooknook.db");
const database = new Database(databasePath);

database.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT,
    format TEXT NOT NULL,
    isbn TEXT,
    doi TEXT,
    cover_url TEXT,
    file_url TEXT,
    status TEXT NOT NULL DEFAULT 'approved',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const insertBook = database.prepare(`
  INSERT INTO books (
    title,
    author,
    description,
    format,
    isbn,
    status
  )
  VALUES (?, ?, ?, ?, ?, ?)
`);

const existingBooks = database
  .prepare("SELECT COUNT(*) AS total FROM books")
  .get();

if (existingBooks.total === 0) {
  insertBook.run(
    "Pride and Prejudice",
    "Jane Austen",
    "A classic novel about family, society, and relationships.",
    "novel",
    "9780141439518",
    "approved"
  );

  insertBook.run(
    "Frankenstein",
    "Mary Shelley",
    "A scientist creates a living being with tragic consequences.",
    "novel",
    "9780141439471",
    "approved"
  );

  insertBook.run(
    "The Art of War",
    "Sun Tzu",
    "An ancient work about strategy and leadership.",
    "academic",
    "9781599869773",
    "approved"
  );
}

database.close();

console.log("Database and books table created successfully.");