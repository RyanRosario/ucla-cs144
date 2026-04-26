# Sample Data for Local Testing

The file `mammoth.bson` contains a dump of documents from the production
MongoDB instance.

## When to use this

This project supports three data sources, configured in `.env`:

1. **`USE_DB=false`** — reads from `fixtures/*.json`. No database
   needed. Use this until we cover MongoDB in lecture.
2. **`USE_DB=true`, `DEBUG=true`** — connects to a local MongoDB at
   `localhost:27017`. Use the dump in this file to seed it.
3. **`USE_DB=true`, `DEBUG=false`** — connects to `cs144.org`
   (production). Use only after your code is validated locally.

This sample dump is for step 2.

## Loading the dump

Make sure MongoDB is installed and running locally, then:

```bash
mongorestore --uri="mongodb://localhost:27017" --db=mammoth --collection=status mammoth.bson
```

Then set `USE_DB=true` and `DEBUG=true` in your `.env`.

The dump will be refreshed periodically. Your code must execute correctly
against the production server.
