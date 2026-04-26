// NOTHING TO DO HERE

import { TrailDifficulty, TrailStatus } from "../../models/Enum.js";

export type TrailStatusType = typeof TrailStatus[keyof typeof TrailStatus];
export type TrailDifficultyType = typeof TrailDifficulty[keyof typeof TrailDifficulty];

export interface Trail {
  name: string;
  status: TrailStatusType;
  difficulty: TrailDifficultyType;
  features: string[];
  symbol: string;
}