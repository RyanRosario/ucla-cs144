import { z } from 'zod';
import { t } from '../config.js'
import { LiftService } from '../services/liftService.js';
import { LiftStatus } from '../../models/Enum.js';

const router = t.router;
const publicProcedure = t.procedure;

// Create a Zod validator using nativeEnum
const liftStatusValidator = z.nativeEnum(LiftStatus);

export const liftRouter = router({
  // TODO: Implement a procedure to get the latest lift information
  // This should return all lifts in the current batch or an empty array if none exists
  getLatest: publicProcedure.query(async () => {
    // Student implementation here
    console.log("getLatest procedure not yet implemented");
    return [];
  }),
  
  // TODO: Implement a procedure to get a specific lift by name
  // This should validate the input using Zod and return the lift or an empty object if not found
  getByName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      // TODO: Implement me!
      console.log("getByName procedure not yet implemented");
      return {};
    }),

  // TODO: Implement a procedure to update a lift's status IN REDIS
  // This should validate the input using the liftStatusValidator and return the result of the update
  // There are a couple of ways to do this.
  updateStatus: publicProcedure
    .input(z.object({ 
      name: z.string(),
      status: liftStatusValidator
    }))
    .mutation(async ({ input }) => {
      // TODO: Implement me!
      console.log("updateStatus procedure not yet implemented");
      return { success: false, message: "Not implemented" };
    }),
});