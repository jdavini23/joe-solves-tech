"use strict";
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { build, renderTemplate, DIST } = require("../scripts/build");
const { createDevServer } = require("../scripts/dev-server");

function digestDirectory(directory) {
  const hash = crypto.createHash("sha256");
  function visit(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(current, entry.name);
      if (entry.isDirectory()) visit(file);
      else { hash.update(path.relative(directory, file)); hash.update(fs.readFileSync(file)); }
    }
  }
  visit(directory);
  return hash.digest("hex");
}

test("build is deterministic and structurally complete", () => {
  build();
  const first = digestDirectory(DIST);
  build();
  assert.equal(digestDirectory(DIST), first);
  const html = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
  assert.doesNotMatch(html, /@include/);
  assert.match(html, /<html lang="en" class="no-js">/);
  assert.match(html, /document\.documentElement\.className = "js"/);
  assert.match(html, /<script type="module" src="\/assets\/js\/main\.js"><\/script>/);
  const ids = Array.from(html.matchAll(/\sid="([^"]+)"/g), (match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, "IDs must be unique");
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(target), "Missing fragment target #" + target);
  for (const asset of ["assets/site.css", "assets/js/main.js"]) assert.ok(fs.existsSync(path.join(DIST, asset)), "Missing " + asset);
  const css = fs.readFileSync(path.join(DIST, "assets", "site.css"), "utf8");
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
  const main = fs.readFileSync(path.join(DIST, "assets", "js", "main.js"), "utf8");
  assert.match(main, /IntersectionObserver/);
  assert.match(main, /classList\.remove\("js"\)/);
});

test("template includes reject missing and escaped paths", () => {
  assert.throws(() => renderTemplate('<!-- @include "../README.md" -->'), /outside approved/);
  assert.throws(() => renderTemplate('<!-- @include "sections/missing.html" -->'), /Missing include/);
});

test("all JavaScript module imports resolve", () => {
  build();
  const directory = path.join(DIST, "assets", "js");
  for (const filename of fs.readdirSync(directory).filter((file) => file.endsWith(".js"))) {
    const body = fs.readFileSync(path.join(directory, filename), "utf8");
    for (const [, relativePath] of body.matchAll(/from\s+"(\.[^"]+)"/g)) assert.ok(fs.existsSync(path.resolve(directory, relativePath)), filename + " imports missing " + relativePath);
  }
});

test("development server exposes production assets and comparison tools", async (context) => {
  build();
  const server = createDevServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  context.after(() => new Promise((resolve) => server.close(resolve)));
  const { port } = server.address();
  for (const route of ["/", "/assets/site.css", "/assets/js/main.js", "/compare/", "/compare/before.html"]) {
    const response = await fetch("http://127.0.0.1:" + port + route);
    assert.equal(response.status, 200, route);
  }
  assert.equal((await fetch("http://127.0.0.1:" + port + "/../README.md")).status, 404);
});
