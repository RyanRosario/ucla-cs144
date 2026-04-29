require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Book = require("./models/Book");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const { MONGO_USER, MONGO_PASS, MONGO_HOST, MONGO_PORT, MONGO_DB, MONGO_AUTH_SOURCE } = process.env;
const uri = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=${MONGO_AUTH_SOURCE}`;

mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Autocomplete: regex search on title
app.get("/api/books/search", async (req, res) => {
  const q = req.query.q || "";
  if (q.length < 2) return res.json([]);

  const books = await Book.find(
    { title: { $regex: q, $options: "i" } },
    { title: 1 }
  )
    .sort({ title: 1 })
    .limit(10);

  res.json(books);
});

// Get a single book by ID
app.get("/api/books/:id", async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ error: "Book not found" });
  res.json(book);
});

// Insert a new book
app.post("/api/books", async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a book
app.put("/api/books/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a book
app.delete("/api/books/:id", async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) return res.status(404).json({ error: "Book not found" });
  res.json({ message: "Book deleted" });
});

const PORT = process.env.PORT || 3456;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
