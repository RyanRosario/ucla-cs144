import { z } from 'zod';
import { t } from '../config.js';
import { getLatestBatch } from '../../utils/mongodb.js';
import type { Trail } from '../types/trail.js';
import { BatchType } from '../../models/Enum.js';
import { TrailService } from '../services/trailService.js';
import { TrailStatus } from '../../models/Enum.js';

const router = t.router;
const publicProcedure = t.procedure;

// Create a Zod validator using nativeEnum
const trailStatusValidator = z.nativeEnum(TrailStatus);

export const trailRouter = router({
  // TODO: Implement a procedure to get the latest trail information
  // This should return all trails in the current batch or an empty array if none exists
  getLatest: publicProcedure.query(async () => {
    // Student implementation here
    console.log("getLatest procedure not yet implemented");
    return [];
  }),
  
  // TODO: Implement a procedure to get a specific trail by name
  // This should validate the input using Zod and return the trail or an empty object if not found
  getByName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      // TODO: Implement me!
      console.log("getByName procedure not yet implemented");
      return {};
    }),

  // Unlike the lift router, we don't need an update function for trails this year.
  // We are giving you a break.
});