/*CS143 - WINTER 2025 - LECTURE 14 - MONGODB DEMO

To install MongoDB, follow the directions below:
https://docs.mongodb.com/manual/installation/

BASIC CRUD (WITHOUT THE R)
*/

show dbs

use demo		// doesn't need to already exist
show collections

//Insert one record
db.cs22SCourses.insertOne(
	{ 
		code: "CS 143",
		title: "Data Management Systems",  // String
		lec_days: ["M", "W"],	// Array
		time_from: 16,
		time_to: 18,
		professor: {
			name: "Rosario, R. R.",
			email: "rrosario@cs.ucla.edu"
		},
		ta: ["Tyler", "Song", "Vivian"],
	}
);

// Add two graders.
// Add a TA to the TA array.
db.cs22SCourses.updateOne(
	{ code: "CS 143" }, 	
	{
		$set: { 
			grader: ["Madhav", "Nicole"]
		},
	  	$push: { ta: "Hughes" }
	}	 
);

db.cs22SCourses.insertMany([
	{
		code: "CS 130",
		professor: ["Burns, M.", "Hyman, J."]
	},
	{
		code: "CS 111"
	}
]);

// Delete CS 111.
db.cs22SCourses.deleteOne({
	code: "CS 111"
});

db.cs22SCourses.deleteMany({});



/* YELP QUERYING DEMO

Then open mongodb shell by typing "mongosh".
Create the Yelp database
*/

use yelp

/* The data can be downloaded from Google Drive here:
Yelp Reviews: https://drive.google.com/file/d/1zcsFB-4AwDwPDwwlU4NG5ELr28Aq8bPZ/view?usp=sharing

#Once you download the tar file, expand it and cd into the directory.

Now we load in our data. In this case we have several files so we will import one
file at a time. 

Load in each file into a new collection. A collection is analogous to a relation and a document/object
is analogous to a "row" or "tuple".*/

mongoimport --db yelp --collection business --file yelp_academic_dataset_business.json

// What does a Yelp business record look like?
> db.business.findOne({ categories: {$regex: "Restaurants" } })
{
	"_id" : ObjectId("60b540bdd8f924bd13670997"),
	"business_id" : "NDuUMJfrWk52RA-H-OtrpA",
	"name" : "Bolt Fresh Bar",
	"address" : "1170 Queen Street W",
	"city" : "Toronto",
	"state" : "ON",
	"postal_code" : "M6J 1J5",
	"latitude" : 43.6428886,
	"longitude" : -79.4254291,
	"stars" : 3,
	"review_count" : 57,
	"is_open" : 1,
	"attributes" : {
		"WiFi" : "u'no'",
		"BikeParking" : "True",
		"RestaurantsPriceRange2" : "2",
		"BusinessParking" : "{'garage': False, 'street': True, 'validated': False, 'lot': False, 'valet': False}",
		"RestaurantsTakeOut" : "True",
		"Caters" : "False"
	},
	"categories" : "Juice Bars & Smoothies, Food, Restaurants, Fast Food, Vegan",
	"hours" : {
		"Monday" : "8:0-21:0",
		"Tuesday" : "8:0-21:0",
		"Wednesday" : "8:0-21:0",
		"Thursday" : "8:0-21:0",
		"Friday" : "8:0-21:0",
		"Saturday" : "9:0-21:0",
		"Sunday" : "9:0-21:0"
	}
}

/* Can search a range using:
field : { $gte: value, $lte: value}*/


// Let's retreive all Starbucks, their states and ratings.
db.business.find({
	name: "Starbucks", 
}, {
	name: 1,
	state: 1,
	stars: 1,
	_id: 0
});

// To make it a "non equal", we can replace name: "Starbucks" with name: { $ne: "Starbucks" }

// Let's retrieve all Indian, Mexican or Italian restaurants that are either
// casual attire or takeout (if it's not casual attire, I will take the food out).
// Additionally, if I sit inside, there should be free Wifi. 
db.business.find({
	$or: [
		{ "attributes.RestaurantsAttire":  "'casual'", "attributes.WiFi": "'free'" },
		{ "attributes.RestaurantsTakeOut": "True" }
	],
	categories: {$regex: "Restaurants"},
	categories: {$regex: "Indian|Italian|Mexican"},
}, {
	name: 1,
	categories: 1,
	stars: 1,
	state: 1, 
	_id: 0
}).sort( { stars: -1 } );


