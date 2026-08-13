// Minimal static server for this folder.
//
// Why not `python3 -m http.server`: Apple's bundled Python (3.9) evaluates
// os.getcwd() while building its argparse defaults, and macOS TCC denies that
// for a process whose cwd is inside ~/Desktop. It fails at import, before any
// flag can redirect it. This server never calls getcwd — ROOT is absolute.

const http = require("http");
const fs = require("fs");
const path = require("path");

// Derived from this file's own location, not process.cwd() — see above.
const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT) || 8000;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".md": "text/plain; charset=utf-8",
};

http
  .createServer((req, res) => {
    let rel;
    try {
      rel = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    } catch {
      res.writeHead(400).end("Bad request");
      return;
    }
    if (rel === "/") rel = "/joe-solves-tech.html";

    // Resolve, then confirm the result is still inside ROOT.
    const filePath = path.join(ROOT, rel);
    if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    fs.readFile(filePath, (err, buf) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type": TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(buf);
    });
  })
  .listen(PORT, "127.0.0.1", () => {
    console.log("serving " + ROOT + " on http://127.0.0.1:" + PORT);
  });
