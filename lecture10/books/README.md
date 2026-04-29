# MongoDB + Mongoose Demo

This directory contains a **Mongoose/Express web app** and a sample dataset
of **1,000 books** used in the Lecture 10 live demo.

## Dataset Structure

Each document has a `title`, `author`, `price`, and `category`. Depending on
the category, documents include additional fields:

| Category | Count | Extra Fields |
|---|---|---|
| `programming` | 100 | `language`, `edition`, `year`, `publisher`, `pages`, `in_stock` |
| `fiction` | 200 | `genre`, `setting`, `pages`, `year`, `publisher`, `award_winner` |
| `history` | 150 | `period`, `region`, `pages`, `year`, `publisher`, `primary_sources` |
| `science` | 150 | `field`, `peer_reviewed`, `pages`, `year`, `publisher`, `for_general_audience` |
| `biography` | 100 | `subject`, `subject_profession`, `era`, `pages`, `year`, `publisher` |
| `self-help` | 100 | `topic`, `pages`, `year`, `publisher`, `bestseller` |
| `cooking` | 100 | `cuisine`, `difficulty`, `num_recipes`, `year`, `publisher`, `vegetarian_friendly` |
| `travel` | 100 | `destination`, `trip_type`, `pages`, `year`, `publisher`, `includes_maps` |

The 100 programming books each have a `language` field containing a programming
language name (Python, JavaScript, Rust, etc.) — used in the aggregation
pipeline example on the slides.

## Prerequisites

- [MongoDB Community Server](https://www.mongodb.com/try/download/community) **or** a free
  [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- [MongoDB Shell (`mongosh`)](https://www.mongodb.com/try/download/shell)
- [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools)
  (provides `mongoimport`)
- [Node.js](https://nodejs.org/)

## Loading the Data

### Option 1 — `mongoimport` (recommended)

```bash
mongoimport --db cs144 --collection books --file books.json --jsonArray
```

If you are connecting to Atlas, supply the connection string:

```bash
mongoimport \
  --uri "mongodb+srv://<user>:<password>@<cluster>.mongodb.net/cs144" \
  --collection Books \
  --file books.json \
  --jsonArray
```

### Option 2 — `mongosh`

```js
// In your terminal, start the shell
mongosh

// Switch to (or create) the cs144 database
use cs144

// Load the file — run this from the directory containing books.json
const docs = JSON.parse(require("fs").readFileSync("books.json", "utf8"));
db.Books.insertMany(docs);

// Verify
db.Books.countDocuments()   // should return 1000
```

## Running the Web App

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file with your MongoDB connection details:

   ```
   MONGO_USER=<username>
   MONGO_PASS=<password>
   MONGO_HOST=localhost
   MONGO_PORT=27017
   MONGO_DB=cs144
   MONGO_AUTH_SOURCE=admin
   ```

3. Start the server:

   ```bash
   npm start
   ```

4. Open <http://localhost:3456> in your browser.

The app provides:
- **Search** — type-ahead autocomplete that searches books by title
- **Book detail** — click a search result to view all of its fields
- **Add a book** — form with category-specific fields and Mongoose schema validation

## Live Demo Walkthrough

Start the app and open <http://localhost:3456>. Open the browser DevTools
**Network** tab so students can see each request.

### 1. Autocomplete — `GET /api/books/search`

Type a few characters into the search bar (e.g. "py"). Point out:

- The frontend debounces input and sends `GET /api/books/search?q=py`.
- On the server (`server.js:20-31`), Mongoose runs `Book.find()` with a
  `$regex` query, projects only the `title` field, sorts alphabetically,
  and limits to 10 results.
- The response is a JSON array of `{ _id, title }` objects that populate the
  dropdown.

### 2. Book Detail — `GET /api/books/:id`

Click one of the autocomplete results. Point out:

- The frontend sends `GET /api/books/<id>` with the `_id` from step 1.
- On the server (`server.js:35-38`), Mongoose calls `Book.findById()` to
  fetch the full document.
- The response contains every field for that book. The frontend renders
  category-specific fields (e.g. `language` for programming, `cuisine` for
  cooking) dynamically.

### 3. Insert — `POST /api/books`

Fill out the "Add a Book" form. Select a category to reveal the
category-specific fields. Submit the form. Point out:

- The frontend sends `POST /api/books` with a JSON body.
- On the server (`server.js:42-49`), Mongoose creates a new `Book` instance
  from the request body, calls `book.save()`, and returns the saved document
  (including the generated `_id`).
- If validation fails (e.g. missing required `title` or invalid `category`),
  Mongoose throws a `ValidationError` and the server returns a 400 with the
  error message. Try submitting with an empty title to demonstrate this.
- After inserting, search for the new book to confirm it was saved.

## Demo Queries (mongosh)

These match the examples shown on the slides.

### Find — retrieve all programming books, show title only

```js
db.Books.find(
    { "category": "programming" },
    { "_id": 0, "title": 1 }
).sort({ "title": 1 }).limit(5);
```

### Find — cheap award-winning fiction under 400 pages

```js
db.Books.find(
    { "category": "fiction", "award_winner": true, "price": { "$lte": 20 }, "pages": { "$lte": 400 } },
    { "_id": 0, "title": 1, "author": 1, "price": 1, "genre": 1 }
).sort({ "price": 1 });
```

### Aggregation — average price of programming books by language

```js
db.Books.aggregate([
  { "$match":  { "category": "programming" } },
  { "$group":  { "_id": "$language", "AvgPrice": { "$avg": "$price" } } },
  { "$project": { "_id": 1, "AvgPrice": { "$round": ["$AvgPrice", 2] } } },
  { "$sort":   { "AvgPrice": -1 } },
  { "$limit":  10 }
]);
```

## Resetting the Collection

```js
db.Books.drop()
```

Then re-run the import step above.
