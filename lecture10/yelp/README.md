# CS 144 — Lecture 10: MongoDB / Yelp Demo

## Getting the Data

Download the Yelp Academic Dataset from Google Drive:

**[Yelp Dataset (Google Drive)](https://drive.google.com/file/d/1zcsFB-4AwDwPDwwlU4NG5ELr28Aq8bPZ/view?usp=sharing)**

Once downloaded, expand the tar file and `cd` into the directory.

## Loading the Data into MongoDB

Open a terminal and run `mongosh`, then create the `cs144` database:

```
use cs144
```

Import each collection from the JSON files:

```sh
mongoimport --db cs144 --collection yelp --file yelp_academic_dataset_business.json
```

A collection is analogous to a relation; a document is analogous to a row/tuple.

## Demo Queries

### What does a business record look like?

```js
db.yelp.findOne({ categories: { $regex: "Restaurants" } })
```

### Retrieve all Starbucks, their states and ratings

```js
db.yelp.find(
    { name: "Starbucks" },
    { name: 1, state: 1, stars: 1, _id: 0 }
);
```

To negate, replace `name: "Starbucks"` with `name: { $ne: "Starbucks" }`.

### Find Indian, Mexican, or Italian restaurants that are casual or offer takeout (with free WiFi if dining in)

```js
db.yelp.find({
    $or: [
        { "attributes.RestaurantsAttire": "'casual'", "attributes.WiFi": "'free'" },
        { "attributes.RestaurantsTakeOut": "True" }
    ],
    categories: { $regex: "Restaurants" },
    categories: { $regex: "Indian|Italian|Mexican" },
}, {
    name: 1,
    categories: 1,
    stars: 1,
    state: 1,
    _id: 0
}).sort({ stars: -1 });
```

### Average Starbucks rating by state (aggregation pipeline)

```js
db.yelp.aggregate([
    // Stage 1: filter to Starbucks only
    { $match: { name: "Starbucks" } },
    // Stage 2: group by state, compute average stars
    { $group: { _id: "$state", average: { $avg: "$stars" } } }
]);
```
