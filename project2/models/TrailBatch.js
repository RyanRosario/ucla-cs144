// NOTHING TO DO HERE

import mongoose from 'mongoose';
import './Trail.js';
import { BatchType } from './Enum.js';
import { COLLECTION } from '../utils/dbconfig.js';

const TrailBatchSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: [BatchType.TrailBatch], // only allow this exact value
        required: true
      },
  timestamp: { type: String, required: true },
  trails: [{
    name: String,
    status: String,
    difficulty: String,
    symbol: String,
    features: [String]
  }]
});

export const TrailBatch = mongoose.model(BatchType.TrailBatch, TrailBatchSchema, COLLECTION);