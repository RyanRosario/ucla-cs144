import { z } from "zod";
import { router, publicProcedure } from "./trpc.js";
import type { Todo } from "../shared/types.js";

const todos: Todo[] = [
  {
    id: "1",
    text: "Learn about tRPC",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    text: "Build a type-safe API",
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

let nextId = 3;

export const todoRouter = router({
  list: publicProcedure.query(() => {
    return todos;
  }),

  add: publicProcedure
    .input(
      z.object({
        text: z.string().min(1, "Todo text cannot be empty"),
      })
    )
    .mutation(({ input }) => {
      const todo: Todo = {
        id: String(nextId++),
        text: input.text,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      todos.push(todo);
      return todo;
    }),

  toggle: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const todo = todos.find((t) => t.id === input.id);
      if (!todo) throw new Error(`Todo "${input.id}" not found`);
      todo.completed = !todo.completed;
      return todo;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const index = todos.findIndex((t) => t.id === input.id);
      if (index === -1) throw new Error(`Todo "${input.id}" not found`);
      const [removed] = todos.splice(index, 1);
      return removed;
    }),
});

export type TodoRouter = typeof todoRouter;
