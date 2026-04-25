import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import liftRoutes from './rest/routes/lift.js';
import trailRoutes from './rest/routes/trail.js';
import { initializeDatabases } from './utils/dbconfig.js';
import http from 'http';
import cors from 'cors';

// tRPC
// import { createExpressMiddleware } from '@trpc/server/adapters/express';
// import { appRouter } from './trpc/index.js';

// Express setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 1919;

// Create HTTP server
const httpServer = http.createServer(app);

// Create Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start Apollo Server
await server.start();

// Connect to databases
const { mongoConnected, redisConnected } = await initializeDatabases();
if (!mongoConnected || !redisConnected) {
  process.exit(1); // Exit if unable to connect to databases
}

// Apply all middleware (keep the original express.json)
app.use(express.json());
app.use(cors());

// REST
app.use('/lifts', liftRoutes);
app.use('/trails', trailRoutes);

// GraphQL endpoint with Apollo Server
app.use('/graphql', expressMiddleware(server));

// tRPC middleware - mounted at /trpc path
// app.use('/trpc', createExpressMiddleware({
//  router: appRouter,
// }));

// Serve static files only if no API route matched (preserved from original)
const projectRoot = path.join(__dirname);
app.use(express.static(path.join(projectRoot, 'public')));

// Specific route for root path to ensure index.html is served
app.get('/', (_, res) => {
  res.sendFile(path.join(projectRoot, 'public', 'index.html'));
});

// Start the server (modified to use httpServer for Apollo)
httpServer.listen(PORT, () => {
  console.log(`Mammoth REST API running on http://localhost:${PORT}`);
  console.log(`GraphQL endpoint available at http://localhost:${PORT}/graphql`);
  // console.log(`tRPC endpoint available at http://localhost:${PORT}/trpc`);
});