# CS 144 — Lecture 10: MongoDB / Airbnb Demo

## Getting the Data

The Airbnb dataset (`listingsAndReviews`) is pre-loaded on the course MongoDB server — no download needed if you are connecting to it.

If you want a local copy, download the compressed JSON file directly:

**[https://cs144.org/data/listingsAndReviews.json.tgz](https://cs144.org/data/listingsAndReviews.json.tgz)**

Or from Google Drive: **[https://drive.google.com/file/d/1V1GorwSA_QQt6nrnkwiMdTpim_g-Z2TZ/view?usp=sharing](https://drive.google.com/file/d/1V1GorwSA_QQt6nrnkwiMdTpim_g-Z2TZ/view?usp=sharing)**

## Loading the Data Locally (optional)

If you have the raw JSON file:

```sh
mongoimport --db airbnb --collection listingsAndReviews \
    --file listingsAndReviews.json --drop
```

Then in `mongosh`:

```
use airbnb
```

## Demo Queries

### What does a listing look like?

```js
db.listingsAndReviews.findOne()
```

### Count all listings

```js
db.listingsAndReviews.countDocuments()

// Equivalently, using the aggregation pipeline:
db.listingsAndReviews.aggregate([
    { $count: "Number of rentals" }
])
```

### Average number of bedrooms for US listings with beach or ocean reviews

```js
db.listingsAndReviews.aggregate([
    {
        $match: {
            "address.country": "United States",
            "reviews.comments": { $regex: "beach|ocean" }
        }
    },
    {
        $group: {
            _id: null,
            AvgBedrooms: { $avg: "$bedrooms" }
        }
    },
    {
        $project: { _id: 0 }
    }
])
```

### Total listings by country (top 5)

```js
db.listingsAndReviews.aggregate([
    {
        $group: {
            _id: "$address.country",
            TotalRentals: { $sum: 1 }
        }
    },
    { $sort: { TotalRentals: -1 } },
    { $limit: 5 }
])
```

### Find entire homes on the Big Island that sleep 4+, sorted by price

```js
db.listingsAndReviews.find(
    {
        "address.market": "The Big Island",
        "address.suburb": "Kailua/Kona",
        "room_type": "Entire home/apt",
        "accommodates": { $gte: 4 },
        "bedrooms":     { $gte: 2 },
        "bathrooms":    { $gte: 2 }
    },
    {
        _id: 0,
        name: 1,
        listing_url: 1,
        property_type: 1,
        number_of_reviews: 1,
        price: 1
    }
).sort({ price: 1 })
```
