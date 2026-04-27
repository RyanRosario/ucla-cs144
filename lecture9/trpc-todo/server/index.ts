import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { todoRouter } from "./router.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  "/trpc",
  createExpressMiddleware({
    router: todoRouter,
  })
);

app.listen(PORT, () => {
  console.log(`tRPC server listening on http://localhost:${PORT}`);
  console.log(`tRPC endpoint: http://localhost:${PORT}/trpc`);
  console.log(`\nTry in browser: http://localhost:${PORT}/trpc/list`);
});
