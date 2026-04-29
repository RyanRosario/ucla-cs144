# MongoDB Books

This directory contains a sample dataset of **1,000 books** used in the
Lecture 10 live demo. The queries in the slides run against this collection.

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

## Demo Queries

These match the examples shown on the slides.

### Find — retrieve all programming books, show title only

```js
db.Books.find(
    { "category": "programming" },
    { "_id": 0, "title": 1 }
).sort({ "title": 1 }).limit(5);
```

### Find — casual but picky restaurant criteria (books edition)

Cheap fiction books, award-winning, under 400 pages:

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
