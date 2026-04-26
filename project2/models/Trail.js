// NOTHING TO DO HERE

import mongoose from 'mongoose';
import { TrailStatus, TrailDifficulty } from './Enum.js';
import { COLLECTION } from '../utils/dbconfig.js';

const TrailSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: Object.values(TrailStatus), required: true },
  difficulty: { type: String, enum: Object.values(TrailDifficulty), required: true },
  symbol: { type: String, required: true },
  features: [{ type: String }]
});

export const Trail = mongoose.model('Trail', TrailSchema, COLLECTION);