const Database = require("better-sqlite3");
const path = require("path");

const databasePath = path.join(
  __dirname,
  "database",
  "freebooknook.db"
);

const database = new Database(databasePath);

const addBook = database.prepare(`
  INSERT INTO books (
    title,
    author,
    description,
    format,
    isbn,
    doi,
    cover_url,
    file_url,
    status
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const book = {
  title: "Alice's Adventures in Wonderland",
  author: "Lewis Carroll",
  description: "Alice follows a white rabbit into a strange fantasy world.",
  format: "novel",
  isbn: "9781503222687",
  doi: null,
  coverUrl: "assets/covers/alice-in-wonderland.jpeg",
  fileUrl: "alice_in_wonderland.pdf",
  status: "approved",
};

const existingBook = database
  .prepare("SELECT id FROM books WHERE isbn = ?")
  .get(book.isbn);

if (existingBook) {
  database
    .prepare(`
      UPDATE books
      SET
        title = ?,
        author = ?,
        description = ?,
        format = ?,
        doi = ?,
        cover_url = ?,
        file_url = ?,
        status = ?
      WHERE id = ?
    `)
    .run(
      book.title,
      book.author,
      book.description,
      book.format,
      book.doi,
      book.coverUrl,
      book.fileUrl,
      book.status,
      existingBook.id
    );

  console.log(`Book ${existingBook.id} updated successfully.`);
} else {
  const result = addBook.run(
    book.title,
    book.author,
    book.description,
    book.format,
    book.isbn,
    book.doi,
    book.coverUrl,
    book.fileUrl,
    book.status
  );

  console.log(`Book added successfully with ID ${result.lastInsertRowid}.`);
}

database.close();
