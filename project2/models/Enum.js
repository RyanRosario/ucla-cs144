// NOTHING TO DO HERE

export const LiftStatus = Object.freeze({
    'CLOSED': 'CLOSED',
    'CLOSED FOR SEASON': 'CLOSED FOR SEASON',
    'OPEN': 'OPEN',
    'NO FOOT PASSENGERS': 'NO FOOT PASSENGERS',
    'EXPECTED': 'EXPECTED',
    'DELAYED': 'DELAYED',
    'WEATHER HOLD': 'WEATHER HOLD',
    'WIND HOLD': 'WIND HOLD',
  });

  export const TrailStatus = Object.freeze({
    'OPEN': 'OPEN',
    'CLOSED': 'CLOSED',
    'CLOSED FOR SEASON': 'CLOSED FOR SEASON',
    'NOT PATROLLED': 'NOT PATROLLED',
  });

  export const TrailDifficulty = Object.freeze({
    'Beginner': 'Beginner', // Green Circle
    'Slightly Difficult': 'Slightly Difficult',  // Blue Square
    'Advanced': 'Advanced', // Black/Blue 
    'Very Difficult': 'Very Difficult',  // Black Diamond
    'Extremely Difficult': 'Extremely Difficult', // Double Black Diamond
    'Freestyle Terrain': 'Freestyle Terrain', // Freestyle Terrain
    'Halfpipe': 'Halfpipe', // Halfpipe
    'Uphill': 'Uphill', // Uphill
    'Adventure Zone': 'Adventure Zone', // Adventure Zone
  });

  export const BatchType = Object.freeze({
    'LiftBatch': 'LiftBatch',
    'TrailBatch': 'TrailBatch'
  });

  export const ObjectType = Object.freeze({
    'lift': 'lift',
    'trail': 'trail'
  });