// NOTHING TO DO HERE

import { ApolloServer } from '@apollo/server';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

// Create Apollo Server instance
export const createApolloServer = () => {
  return new ApolloServer({
    typeDefs,
    resolvers,
  });
};