import { BatchType } from '../../models/Enum.js';
import { getLatestBatch } from '../../utils/mongodb.js';
import { Trail } from '../types/trail.js';

export const TrailService = {
  // Implement a method to get the latest trail batch from MongoDB
  // This should return all trails in the current batch or an empty array if none exists
  async getLatestTrails(): Promise<Trail[]> {
    // TODO: Implement me!
    console.log("getLatestTrails service method not yet implemented");
    return [];
  },

  // Implement a method to get a specific trail by name
  // This should search through the latest trail batch and return the matching trail or null if not found
  async getTrailByName(name: string): Promise<Trail | null> {
    // TODO: Implement me!
    console.log("getTrailByName service method not yet implemented");
    return null;
  },
  
  // You get a break. No update function for trails this year.
};