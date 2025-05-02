import { createClient } from 'redis';
import { REDIS_PREFIX, redisOptions } from './dbconfig.js';
import { getLocalTimestamp } from './dates.js';

// Create a Redis client that can be reused
let redisClient = null;

// Helper function to get or create the Redis client
async function getRedisClient() {
  if (!redisClient) {
    console.log('Creating new Redis client');
    redisClient = createClient(redisOptions);
    
    redisClient.on('error', err => {
      console.error('Redis Client Error:', err);
      redisClient = null; // Reset the client on error
    });
    
    await redisClient.connect();
    console.log('Connected to Redis successfully');
  }
  
  return redisClient;
}

// Implement a function to fetch JSON objects from Redis cache
/**
 * @param {string} type - The type of data to fetch (e.g., 'lift', 'trail')
 * @returns {Promise<Object|Array|null>} The cached data or null if not found
 */
export async function fetchFromCache(type) {
  const key = `${REDIS_PREFIX}${type}:all`;  // array of lift/trail objects
  
  try {
    // Get the Redis client
    const client = await getRedisClient();
  
    console.log("Attempting to fetch data from cache");

    // TODO: Implement me!
    // Create a client.
    // Test whether or not the key is in the cache.
    // If it is, return the data.
    console.log("Fetching data from Redis cache");
    // If it is not, return null.
    console.log("Key not found in cache");
    // IMPORTANT: Log the required steps
    
    console.log("fetchFromCache function not yet implemented");
    return null;   // update this
  } catch (error) {
    console.error(`Error fetching from Redis:`, error);
    return null;
  }
}

// Implement a function to cache JSON objects in Redis.
/**
 * @param {string} type - The type of data to cache (e.g., 'lift', 'trail')
 * @param {Object|Array|string} blob - The data to cache
 * @param {number} expiration - Expiration time in seconds (default: 300)
 * @returns {Promise<boolean>} True if caching was successful, false otherwise
 */
export async function cacheResult(type, blob, expiration = 300) {
  const key = `${REDIS_PREFIX}${type}:all`;
  
  try {
    // Get the Redis client
    const client = await getRedisClient();
    
    // TODO: Implement me!
    // Store the blob in the cache with the appropriate key.
    // IMPORTANT: Log the required steps
    console.log("Writing data to cache");
    
    console.log("cacheResult function not yet implemented");
    return false;  // update this
  } catch (error) {
    console.error(`Error caching result:`, error);
    return false;
  }
}

// THE FUNCTION BELOW MAY NOT BE NEEDED DEPENDING ON YOUR DESIGN CHOICE
// Implement a function to update a specific key in Redis
/**
 * @param {string} name - The name of the item to update
 * @param {string} type - The type of item ('lift' or 'trail')
 * @param {string} status - The new status value
 * @param {Object} additionalProps - Additional properties to update (optional)
 * @returns {Promise<boolean>} True if update was successful, false otherwise
 */
export async function updateKey(name, type, status, additionalProps = {}) {
//   if (!name || !type || !status) {
//     console.error('Missing required parameters');
//     throw new Error('Name, type, and status are required');
//   }
  
//   if (type !== 'lift' && type !== 'trail') {
//     console.error(`Invalid type: ${type}`);
//     throw new Error('Type must be lift or trail');
//   }
  
//   try {
//     // Get the Redis client
//     const client = await getRedisClient();
    
//     // TODO: Implement me!
//     // 1. Format the Redis key: `${REDIS_PREFIX}${type}:${name}`
//     // 2. Create properties object: { status, lastUpdated: getLocalTimestamp(), ...additionalProps }
//     // 3. Use client.hSet() to update properties in Redis
//     // 4. Use client.hGet() to verify the update
    
//     console.log("updateKey function not yet implemented");
//     return false;
//   } catch (error) {
//     console.error(`Error updating Redis:`, error);
//     return false;
//   }
}