// NOTHING TO DO HERE

import { router } from './config.js'
import { MongoClient } from 'mongodb';
import { liftRouter } from './routers/lift.js';
import { trailRouter } from './routers/trail.js';
import { MONGO_URI, DB_NAME } from '../utils/dbconfig.js';

const client = new MongoClient(MONGO_URI);
const db = client.db(DB_NAME);

// Combine all sub-routers
export const appRouter = router({
  lift: liftRouter,
  trail: trailRouter,
});

export type AppRoute = typeof appRouter;
export const createContext = async () => ({
    db
})
export type AppRouter = typeof appRouter;