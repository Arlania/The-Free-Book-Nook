const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const port = 3000;

const databasePath = path.join(__dirname, "database", "freebooknook.db");
const database = new Database(databasePath);

app.use(express.json());

// Serve the current HTML, CSS, JavaScript, and asset files.
app.use(express.static(__dirname));

app.get("/api/books/search", (request, response) => {
  const query = String(request.query.q || "").trim();

  if (!query) {
    return response.json([]);
  }

  const searchValue = `%${query}%`;

  const books = database
    .prepare(`
      SELECT
        id,
        title,
        author,
        description,
        format,
        isbn,
        doi,
        cover_url,
        file_url
      FROM books
      WHERE status = 'approved'
        AND (
          title LIKE ?
          OR author LIKE ?
          OR isbn LIKE ?
          OR doi LIKE ?
        )
      ORDER BY title
      LIMIT 50
    `)
    .all(searchValue, searchValue, searchValue, searchValue);

  response.json(books);
});

app.listen(port, () => {
  console.log(`The Free Book Nook is running at http://localhost:${port}`);
});