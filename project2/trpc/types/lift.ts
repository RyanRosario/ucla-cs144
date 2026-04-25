// NOTHING TO DO HERE

import { LiftStatus } from "../../models/Enum.js";

export type LiftStatusType = typeof LiftStatus[keyof typeof LiftStatus];

export interface Lift {
    name: string;
    status: LiftStatusType;
    lastUpdated: Date;
    capacity: number | 'Gondola';
    rideTime: number;
    misc?: string;
  }