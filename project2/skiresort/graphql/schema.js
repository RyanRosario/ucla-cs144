// NOTHING TO DO HERE

export const typeDefs = `
  type Lift {
    name: String!
    status: String!
    type: String
    lastUpdated: String
    rideTime: Int
    capacity: String
    misc: String
  }

  type Trail {
    name: String!
    status: String!
    difficulty: String!
    symbol: String
    type: String
    lastUpdated: String
  }

  type LiftBatch {
    type: String!
    timestamp: String!
    lifts: [Lift!]!
  }

  type TrailBatch {
    type: String!
    timestamp: String!
    trails: [Trail!]!
  }

  type FieldResponse {
    value: String
  }

  type StatusResponse {
    message: String
  }

  input LiftInput {
    name: String!
    status: String!
  }

  input TrailInput {
    name: String!
    status: String!
  }

  type Query {
    liftsLatest: LiftBatch
    trailsLatest: TrailBatch
  }

  type Mutation {
    updateLift(input: LiftInput!): StatusResponse
    updateTrail(input: TrailInput!): StatusResponse
  }
`;