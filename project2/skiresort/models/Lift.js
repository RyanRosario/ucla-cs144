// NOTHING TO DO HERE

import mongoose from 'mongoose';
import { LiftStatus } from './Enum.js';
import { COLLECTION } from '../utils/dbconfig.js';

const LiftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: Object.values(LiftStatus), required: true },
  rideTime: { type: Number, required: true },
  lastUpdated: { type: String, required: true },
  capacity: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: value =>
        typeof value === 'number' || value === 'Gondola',
      message: 'Capacity must be a number or "Gondola"',
    }
  },
  misc: { type: String, required: false },
});

export const Lift = mongoose.model('Lift', LiftSchema, COLLECTION);