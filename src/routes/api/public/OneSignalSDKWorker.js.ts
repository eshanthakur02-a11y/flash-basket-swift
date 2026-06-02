import { createFileRoute } from "@tanstack/react-router";

const BODY = `importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");\n`;

function handler() {
  return new Response(BODY, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Service-Worker-Allowed": "/",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export const Route = createFileRoute("/api/public/OneSignalSDKWorker/js")({
  server: { handlers: { GET: handler } },
});
