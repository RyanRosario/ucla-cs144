import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { TodoRouter } from "../server/router.js";

const client = createTRPCClient<TodoRouter>({
  links: [httpBatchLink({ url: "http://localhost:3000/trpc" })],
});

// ============================================================
//  tRPC: Every bug below is caught at COMPILE TIME (red squiggles)
// ============================================================

// ERROR 1: Wrong procedure name — "todos" doesn't exist, it's "list"
const todos = await client.todos.query();

// ERROR 2: Wrong input field — "title" doesn't exist, should be "text"
const todo = await client.add.mutate({ title: "Buy milk" });

// ERROR 3: Wrong input type — id expects a string, not a number
await client.toggle.mutate({ id: 42 });

// ERROR 4: Wrong method — "list" is a query, not a mutation
const items = await client.list.mutate();

// ERROR 5: Accessing a field that doesn't exist on the return type
const newTodo = await client.add.mutate({ text: "Buy milk" });
console.log(newTodo.done);       // no such field — it's "completed"
console.log(newTodo.title);      // no such field — it's "text"

// ============================================================
//  fetch: The SAME bugs compile and run fine — they fail silently
//  or crash at runtime in production
// ============================================================

// BUG 1: Typo in URL — no compiler error, 404 at runtime
const res1 = await fetch("http://localhost:3000/trpc/todos");
const data1 = await res1.json();   // empty or error, no type help

// BUG 2: Wrong field name — no compiler error, server ignores "title"
const res2 = await fetch("http://localhost:3000/trpc/add", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Buy milk" }),  // should be "text"
});

// BUG 3: Wrong type — no compiler error, Zod rejects at runtime
const res3 = await fetch("http://localhost:3000/trpc/toggle", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: 42 }),             // should be string
});

// BUG 4: Response type is just `any` — typos in field access compile fine
const res4 = await fetch("http://localhost:3000/trpc/list");
const data4 = await res4.json();      // type is `any`
console.log(data4[0].done);           // no error — but field is "completed"
console.log(data4[0].title);          // no error — but field is "text"
