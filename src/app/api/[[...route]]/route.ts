import { createApp } from "../../../../backend/app.js";

export const runtime = "nodejs";

let honoApp: ReturnType<typeof createApp> | null = null;

const getApp = () => {
  if (!honoApp) {
    honoApp = createApp();
  }
  return honoApp;
};

const forward = (req: Request) => getApp().fetch(req);

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const DELETE = forward;
export const PATCH = forward;
export const OPTIONS = forward;
