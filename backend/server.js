import { serve } from "@hono/node-server";
import { createApp } from "./app.js";

const { PORT = 4000 } = process.env;

const app = createApp();

serve(
  {
    fetch: app.fetch,
    port: Number(PORT),
  },
  () => {
    console.log(`API server running on http://localhost:${PORT}`);
    console.log(`API base path: http://localhost:${PORT}/api`);
  },
);
