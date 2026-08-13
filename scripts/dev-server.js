"use strict";
const fs = require("fs");
const http = require("http");
const path = require("path");
const { build, DIST, ROOT } = require("./build");

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };
function safeFile(root, relativePath) {
  const file = path.resolve(root, relativePath);
  return file === root || file.startsWith(root + path.sep) ? file : null;
}
function route(pathname) {
  if (pathname === "/" || pathname === "/index.html") return path.join(DIST, "index.html");
  if (pathname === "/compare" || pathname === "/compare/") return path.join(ROOT, "tools", "compare", "index.html");
  if (pathname === "/compare/before.html") return path.join(ROOT, "tools", "compare", "before.html");
  const requested = pathname.endsWith("/") ? pathname + "index.html" : pathname;
  return safeFile(DIST, requested.replace(/^\/+/, ""));
}
function createDevServer() {
  return http.createServer((request, response) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname); }
    catch (error) { response.writeHead(400).end("Bad request"); return; }
    const file = route(pathname);
    if (!file) { response.writeHead(404, { "Content-Type": "text/plain" }).end("Not found"); return; }
    fs.readFile(file, (error, body) => {
      if (error) { response.writeHead(404, { "Content-Type": "text/plain" }).end("Not found"); return; }
      response.writeHead(200, { "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
      response.end(body);
    });
  });
}
function watchSource() {
  let timer;
  const rebuild = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try { build(); console.log("Rebuilt dist"); }
      catch (error) { console.error("Build failed:", error.message); }
    }, 80);
  };
  const watchDirectory = (directory) => {
    fs.watch(directory, rebuild);
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) watchDirectory(path.join(directory, entry.name));
    }
  };
  watchDirectory(path.join(ROOT, "src"));
}
if (require.main === module) {
  build();
  if (!process.argv.includes("--no-watch")) watchSource();
  const port = Number(process.env.PORT) || 8000;
  createDevServer().listen(port, "127.0.0.1", () => console.log("Serving http://127.0.0.1:" + port));
}
module.exports = { createDevServer, route, safeFile };
