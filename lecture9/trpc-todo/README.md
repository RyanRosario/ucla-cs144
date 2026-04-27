# tRPC Todo Demo — CS144 Lecture 9

A minimal fullstack tRPC application demonstrating end-to-end type safety between a Node.js server and client — no code generation, no REST boilerplate, just shared TypeScript types.

## What is tRPC?

[tRPC](https://trpc.io/) lets you build APIs where the server and client share a single TypeScript type definition. Instead of writing REST endpoints, request/response types, and validation separately, you define **procedures** on the server and call them directly from the client with full autocomplete and type checking. The client never imports server *code* — only the server's *type*, which TypeScript erases at runtime.

## Quick Start

```bash
cd trpc-todo
npm install

# Option 1: Run server and client together
npm run demo

# Option 2: Run separately (two terminals)
npm run server          # Terminal 1
npm run client          # Terminal 2
```

To use a different port (default is 3000):

```bash
PORT=3001 npm run server
PORT=3001 npm run client
```

## Project Structure

```
trpc-todo/
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript config (editor support)
├── shared/
│   └── types.ts          # Todo interface shared by server + client
├── server/
│   ├── trpc.ts           # One-time tRPC initialization
│   ├── router.ts         # Todo router: list, add, toggle, delete
│   └── index.ts          # Express server with tRPC middleware
└── client/
    └── index.ts          # Standalone client exercising every procedure
```

## Key Concepts

| Concept | Where in the code | What it does |
|---|---|---|
| `initTRPC.create()` | `server/trpc.ts` | Creates the tRPC instance (called once) |
| `router({...})` | `server/router.ts` | Groups related procedures into a router |
| `publicProcedure.query()` | `server/router.ts:23` | Defines a read operation (like GET) |
| `publicProcedure.input(z.object({...})).mutation()` | `server/router.ts:27-41` | Defines a write operation with Zod validation |
| `type TodoRouter = typeof todoRouter` | `server/router.ts:62` | Exports the router's type for the client |
| `import type { TodoRouter }` | `client/index.ts:2` | Imports only the type (zero runtime code from server) |
| `createTRPCClient<TodoRouter>` | `client/index.ts:6` | Creates a typed client with full autocomplete |
| `client.list.query()` | `client/index.ts:29` | Type-safe query call |
| `client.add.mutate({ text: "..." })` | `client/index.ts:33` | Type-safe mutation call |
| `createExpressMiddleware` | `server/index.ts:9` | Mounts tRPC on an Express app |

## How tRPC Compares to REST

| | Traditional REST (Express) | tRPC |
|---|---|---|
| **Define routes** | `app.get('/api/todos', handler)` | `list: publicProcedure.query(...)` |
| **Input validation** | Manual or middleware (express-validator) | Built-in with Zod: `.input(z.object({...}))` |
| **Client calls** | `fetch('/api/todos')` + manual types | `client.list.query()` with inferred types |
| **Type safety** | None without extra tooling | End-to-end, automatic |
| **Add a new field** | Update route, update client, hope they match | Change the procedure, TypeScript catches every call site |
| **Endpoint discovery** | Read docs or code | Autocomplete in your editor |

## In-Class Demo Script

1. **Show the router** (`server/router.ts`): Walk through the four procedures — `list`, `add`, `toggle`, `delete`. Point out `query()` vs `mutation()` and the Zod `.input()` calls.

2. **Show the server** (`server/index.ts`): Compare to Express route definitions from previous lectures. Instead of `app.get(...)`, `app.post(...)`, etc., there's a single `app.use('/trpc', createExpressMiddleware(...))`.

3. **Show the client** (`client/index.ts`): Highlight `import type` — only the type crosses the boundary. Then show `createTRPCClient<TodoRouter>` and how `client.add.mutate(...)` is fully typed.

4. **Run the demo**: `npm run demo`. Walk through the output — list, add, toggle, delete, then the validation error.

5. **Live-code a type error**: In `client/index.ts`, try `client.add.mutate({ text: 123 })`. TypeScript immediately flags the error. Try `client.update.mutate()` — TypeScript says `update` doesn't exist on the router.

6. **Show the browser**: Visit `http://localhost:3000/trpc/list` to see that queries are just GET requests returning JSON.

## Dependencies

| Package | Purpose |
|---|---|
| `@trpc/server` | Server-side tRPC (routers, procedures, middleware adapter) |
| `@trpc/client` | Client-side tRPC (typed client, HTTP links) |
| `express` | HTTP server framework |
| `zod` | Schema validation and type inference |
| `tsx` | TypeScript execution without a build step |
