import express from 'express';
import { getLatestBatch, getNearestBatch } from '../../utils/mongodb.js';
import { cacheResult, updateKey } from '../../utils/redis.js';
import { BatchType } from '../../models/Enum.js';
import { ObjectType } from '../../models/Enum.js';
import { fetchFromCache } from '../../utils/redis.js';
import { LiftStatus } from '../../models/Enum.js';

const router = express.Router();

// Unless otherwise noted, you must implement a caching layer for each endpoint
// except for the write. With clever coding this is rather painless.
// IMPORTANT: You MUST have console.log statements to show that the
// architecture is being used:
// 1. "Attempting to fetch data from cache"
// 2. "Data found / not found in cache"
// 3. "Fetching data from MongoDB"
// 4. "Writing data to cache"
// All inserts into the cache MUST have a TTL of only 5 minutes.

router.get('/latest', async (req, res) => {
  try {
    // TODO: First, implement getting the latest lift batch from MongoDB
    // Return an array with the lift name and its data.

    
    console.log("This endpoint is not yet implemented");
    // Return 501 Not Implemented until students implement this route
    res.status(501).json({ error: "Not implemented" });
  } catch (error) {
    console.error("Error in /latest route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/latest/open', async (req, res) => {
  try {
    // TODO: Return only lifts that are OPEN.
    // There are a couple of ways to do this.
    // Return an array with the lift name and its data.
    
    console.log("This endpoint is not yet implemented");
    // Return 501 Not Implemented until students implement this route
    res.status(501).json({ error: "Not implemented" });
  } catch (error) {
    console.error("Error in /latest/open route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/latest/:name', async (req, res) => {
  try {
    // TODO: Implement getting a specific lift by name.
    // If the proper parameters are not passed, return the proper HTTP code with message.
    // If the lift does not exist, return empty.
    // Note that there are a couple of ways to do this.
    // You should return a JSON object with the lift name and its data.
    
    console.log("This endpoint is not yet implemented");
    // Return 501 Not Implemented until students implement this route
    res.status(501).json({ error: "Not implemented" });
  } catch (error) {
    console.error("Error in /latest/:name route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/latest/:name/:field', async (req, res) => {
  try {
    // TODO: Implement getting a specific field of a lift
    // If the proper parameters are not passed, return the proper HTTP code with message.
    // If the lift does not exist, return empty.
    // If the field does not exist, return empty.
    // Return a JSON object with the trail name and the requested field.
    
    console.log("This endpoint is not yet implemented");
    // Return 501 Not Implemented until students implement this route
    res.status(501).json({ error: "Not implemented" });
  } catch (error) {
    console.error("Error in /latest/:name/:field route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/at/:timestamp', async (req, res) => {
  try {
    // TODO: Implement getting lifts at a specific timestamp
    // If the proper parameters are not passed, return the proper HTTP code with message.
    // If the timestamp is not of the correct format, return the proper HTTP code with message.
    // Return an array of JSON objects with the lift name and its data.
    // YOU DO NOT NEED TO IMPLEMENT CACHING HERE
    
    console.log("This endpoint is not yet implemented");
    // Return 501 Not Implemented until students implement this route
    res.status(501).json({ error: "Not implemented" });
  } catch (error) {
    console.error("Error in /at/:timestamp route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* TODO: Create an API endpoint /update to update the current status of a specific lift
   from the simple web page. You must pick the correct HTTP method. 
*/

export default router;