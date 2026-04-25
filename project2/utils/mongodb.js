import mongoose from 'mongoose';
import { LiftBatch } from '../models/LiftBatch.js';
import { TrailBatch } from '../models/TrailBatch.js';
import { BatchType } from '../models/Enum.js';

// Utility: choose model by type
function getBatchModel(type) {
  switch (type) {
    case BatchType.LiftBatch: return LiftBatch;
    case BatchType.TrailBatch: return TrailBatch;
    default: throw new Error(`Unknown batch type: ${type}`);
  }
}

// Implement a function to get the latest batch by type
// This should query the appropriate model and return the most recent document
export async function getLatestBatch(type) {
  // TODO: Implement me!
  console.log("getLatestBatch function not yet implemented");
  return [];
}

// Implement a function to get the latest open lifts or trails
// This should use getLatestBatch and then filter for only items with "open" in the status
export async function getLatestOpen(type) {
  // TODO: Implement me!
  console.log("getLatestOpen function not yet implemented");
  return [];
}

// Implement a function to get the nearest batch to a given timestamp
// This should find the batch with a timestamp closest to (but before) the queried timestamp
// For example: you query for 11am today, but the most recent batch BEFORE 11am is 9am,
// so your function should return the 9am batch.
export async function getNearestBatch(type, ts) {
  // TODO: Implement me!
  console.log("getNearestBatch function not yet implemented");
  return null;
}

export default { getLatestBatch, getLatestOpen, getNearestBatch };
