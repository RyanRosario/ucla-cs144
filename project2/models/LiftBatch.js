// NOTHING TO DO HERE

import mongoose from 'mongoose';
import './Trail.js';
import { BatchType } from './Enum.js';
import { COLLECTION } from '../utils/dbconfig.js';

const LiftBatchSchema = new mongoose.Schema({
  type: { type: String, enum: [BatchType.LiftBatch], required: true },
  timestamp: { type: String, required: true },
  lifts: [{
    name: String,
    status: String,
    rideTime: Number,
    lastUpdated: String,
    capacity: mongoose.Schema.Types.Mixed,
    misc: String
  }]
});

export const LiftBatch = mongoose.model(BatchType.LiftBatch, LiftBatchSchema, COLLECTION);