import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { TodoRouter } from "../server/router.js";

const PORT = process.env.PORT || 3000;

const client = createTRPCClient<TodoRouter>({
  links: [
    httpBatchLink({
      url: `http://localhost:${PORT}/trpc`,
    }),
  ],
});

function printTodos(
  label: string,
  todos: Array<{ id: string; text: string; completed: boolean }>
) {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`  ${label}`);
  console.log(`${"=".repeat(50)}`);
  for (const t of todos) {
    const check = t.completed ? "[x]" : "[ ]";
    console.log(`  ${check} #${t.id} ${t.text}`);
  }
}

async function main() {
  console.log(`Connecting to tRPC server at http://localhost:${PORT}/trpc\n`);

  // 1. LIST all todos (query)
  console.log("Step 1: Fetching all todos...");
  const initialTodos = await client.list.query();
  printTodos("Initial Todos", initialTodos);

  // 2. ADD a new todo (mutation)
  console.log("\nStep 2: Adding 'Attend CS144 lecture'...");
  const newTodo = await client.add.mutate({ text: "Attend CS144 lecture" });
  console.log(`  Created: #${newTodo.id} "${newTodo.text}"`);

  // 3. ADD another todo
  console.log("\nStep 3: Adding 'Submit project 2'...");
  const anotherTodo = await client.add.mutate({ text: "Submit project 2" });
  console.log(`  Created: #${anotherTodo.id} "${anotherTodo.text}"`);

  // 4. LIST again
  const afterAdd = await client.list.query();
  printTodos("After Adding Todos", afterAdd);

  // 5. TOGGLE a todo complete (mutation)
  console.log(`\nStep 5: Toggling todo #${newTodo.id} to completed...`);
  const toggled = await client.toggle.mutate({ id: newTodo.id });
  console.log(
    `  "${toggled.text}" is now ${toggled.completed ? "completed" : "not completed"}`
  );

  // 6. DELETE a todo (mutation)
  console.log(`\nStep 6: Deleting todo #${anotherTodo.id}...`);
  const deleted = await client.delete.mutate({ id: anotherTodo.id });
  console.log(`  Deleted: "${deleted.text}"`);

  // 7. Final state
  const finalTodos = await client.list.query();
  printTodos("Final Todos", finalTodos);

  // 8. Demonstrate validation error
  console.log("\nStep 8: Trying to add a todo with empty text (should fail)...");
  try {
    await client.add.mutate({ text: "" });
  } catch (err: any) {
    console.log(`  Caught error: ${err.message}`);
    console.log("  Zod validation prevented the bad input!");
  }

  console.log("\nDemo complete!\n");
}

main().catch(console.error);
