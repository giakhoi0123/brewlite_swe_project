// Local HTTP fixture only. It never imports or writes database/application data.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const controlFile = process.argv[2];
if (!controlFile) throw new Error("Pass an absolute path to the JSON control file");
let requestId = 0;
const server = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3011");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  // Explicit test-only auth receiver, enabled only by an authResult in the control file.
  if (req.method === "POST" && req.url === "/api/auth/login") {
    req.resume();
    try {
      const plan = JSON.parse(await readFile(controlFile, "utf8"));
      if (!plan.authResult) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(plan.authResult));
    } catch { res.writeHead(500); res.end(); }
    return;
  }
  if (req.method !== "GET" || req.url !== "/api/products") {
    res.writeHead(404); res.end(); return;
  }
  const id = ++requestId;
  console.log(JSON.stringify({ id, event: "request", authorization: !!req.headers.authorization, cookie: !!req.headers.cookie }));
  let timer;
  let processing = false;
  res.on("close", () => {
    clearInterval(timer);
    console.log(JSON.stringify({ id, event: res.writableEnded ? "complete" : "aborted" }));
  });
  const respond = async () => {
    if (processing || res.destroyed) return;
    processing = true;
    try {
      const plan = JSON.parse(await readFile(controlFile, "utf8"));
      if (plan.hold) return;
      clearInterval(timer);
      if (plan.networkError) { res.destroy(); return; }
      res.writeHead(plan.status ?? 200, { "Content-Type": "application/json" });
      res.end(plan.rawBody ?? JSON.stringify(plan.body ?? []));
    } catch {
      clearInterval(timer);
      res.writeHead(500); res.end();
    } finally {
      processing = false;
    }
  };
  timer = setInterval(respond, 100);
  await respond();
});
server.listen(3012, "127.0.0.1", () => console.log("Test-only products API on localhost:3012; allowed origin localhost:3011"));
