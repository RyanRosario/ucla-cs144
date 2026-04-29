const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: mongoose.Schema.Types.Mixed, required: true },
    price: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "programming",
        "fiction",
        "history",
        "science",
        "biography",
        "self-help",
        "cooking",
        "travel",
      ],
    },

    // programming
    language: String,
    edition: Number,
    in_stock: Boolean,

    // fiction
    genre: String,
    setting: String,
    award_winner: Boolean,

    // history
    period: String,
    region: String,
    primary_sources: Boolean,

    // science
    field: String,
    peer_reviewed: Boolean,
    for_general_audience: Boolean,

    // biography
    subject: String,
    subject_profession: String,
    era: String,

    // self-help
    topic: String,
    bestseller: Boolean,

    // cooking
    cuisine: String,
    difficulty: String,
    num_recipes: Number,
    vegetarian_friendly: Boolean,

    // travel
    destination: String,
    trip_type: String,
    includes_maps: Boolean,

    // shared
    pages: Number,
    year: Number,
    publisher: String,
  },
  { collection: "books" }
);

bookSchema.index({ title: "text" });

module.exports = mongoose.model("Book", bookSchema);
