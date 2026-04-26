// NOTHING TO DO HERE
//
// Loads fixture batches from fixtures/*.json. Used by utils/mongodb.js when
// USE_DB=false, so the API works before MongoDB is set up.
//
// Working against fixtures first, then switching to a real database, is
// standard professional practice. It lets you verify your routes, caching,
// and webpage logic without depending on a network or a database to seed.

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { BatchType } from '../models/Enum.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures');

const FILE_BY_TYPE = {
  [BatchType.TrailBatch]: 'trails.json',
  [BatchType.LiftBatch]:  'lifts.json',
};

async function loadFixture(type) {
  const file = FILE_BY_TYPE[type];
  if (!file) throw new Error(`No fixture for batch type: ${type}`);
  const raw = await fs.readFile(path.join(FIXTURES_DIR, file), 'utf8');
  return JSON.parse(raw);
}

export async function loadFixtureLatest(type) {
  return loadFixture(type);
}

export async function loadFixtureNearest(type, ts) {
  // Single batch per fixture file. Return it iff ts is at or after the batch's
  // timestamp; otherwise there is nothing earlier to return.
  const batch = await loadFixture(type);
  return new Date(ts) >= new Date(batch.timestamp) ? batch : null;
}
