import { getLatestBatch } from '../utils/mongodb.js';
import { updateKey } from '../utils/redis.js';
import { BatchType } from '../models/Enum.js';

export const resolvers = {
  Query: {
    // Lift resolvers
    liftsLatest: async () => {
      // TODO: Implement this resolver to get the latest lift batch
      // in a flexible manner. Remember that the user may specify
      // fewer fields than the ones in the schema.
      return {
        type: BatchType.LiftBatch,
        timestamp: "",
        lifts: []
      };
    },
    
    // Trail resolvers
    trailsLatest: async () => {
      // TODO: Implement this resolver to get the latest lift batch
      // in a flexible manner. Remember that the user may specify
      // fewer fields than the ones in the schema.
      return {
        type: BatchType.TrailBatch,
        timestamp: "",
        trails: []
      };
    },
  },
  
  Mutation: {
    // Lift mutation
    updateLift: async (_, { input }) => {
      // TODO: Implement this mutation to update a single lift's status in Redis
      // and update lastUpdated there as well. You can either modify the JSON
      // blob representing the LiftBatch or update a single property. 
      return { message: 'Not implemented' };
    },
    
    // Trail mutation
    updateTrail: async (_, { input }) => {
      // TODO: Implement this mutation to update a single trail's status in Redis
      // and update lastUpdated there as well. You can either modify the JSON
      // blob representing the LiftBatch or update a single property.
      return { message: 'Not implemented' };
    },
  },
};