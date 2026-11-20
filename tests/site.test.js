"use strict";
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const { build, injectAnalytics, renderTemplate, DIST } = require("../scripts/build");
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
  assert.match(html, /<meta name="google-site-verification" content="SS6mQtMWEG7Ha2XUVj7lNdXq0fzernp1-D0n4_Y9nBs">/);
  assert.match(html, /document\.documentElement\.className = "js"/);
  assert.match(html, /<script type="module" src="\/assets\/js\/main\.js"><\/script>/);
  const ids = Array.from(html.matchAll(/\sid="([^"]+)"/g), (match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, "IDs must be unique");
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(target), "Missing fragment target #" + target);
  for (const asset of ["assets/site.css", "assets/js/main.js", "demo/index.html", "demo/demo.css", "demo/js/main.js", "demo/js/escape.js", "og.png", "favicon.ico", "favicon.svg", "googlea781ebaa82a0d190.html", "robots.txt", "sitemap.xml"]) assert.ok(fs.existsSync(path.join(DIST, asset)), "Missing " + asset);
  assert.match(html, /rel="icon" href="\/favicon\.svg"/);
  const demoHtml = fs.readFileSync(path.join(DIST, "demo/index.html"), "utf8");
  assert.match(demoHtml, /rel="icon" href="\/favicon\.svg"/);
  const demoCss = fs.readFileSync(path.join(DIST, "demo/demo.css"), "utf8");
  assert.match(demoCss, /\.view\{scroll-margin-top:148px\}/);
  assert.match(demoCss, /@media\(min-width:851px\)\{\.view\{scroll-margin-top:92px\}\}/);
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

test("Google Analytics is enabled only with a valid measurement ID", () => {
  const source = "<html><head><title>Test</title></head><body></body></html>";
  assert.equal(injectAnalytics(source), source);
  const tracked = injectAnalytics(source, "g-abc123");
  assert.match(tracked, /googletagmanager\.com\/gtag\/js\?id=G-ABC123/);
  assert.match(tracked, /gtag\("config", "G-ABC123"\)/);
  assert.throws(() => injectAnalytics(source, "UA-12345"), /GA_MEASUREMENT_ID/);
});

test("configured analytics is added to every public HTML page", () => {
  build({ measurementId: "G-ABC123" });
  for (const relativePath of ["index.html", "demo/index.html"]) {
    const html = fs.readFileSync(path.join(DIST, relativePath), "utf8");
    assert.match(html, /gtag\("config", "G-ABC123"\)/, relativePath);
  }
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
  for (const route of ["/", "/assets/site.css", "/assets/js/main.js", "/demo/", "/demo/demo.css", "/demo/js/main.js", "/favicon.ico", "/favicon.svg", "/googlea781ebaa82a0d190.html", "/robots.txt", "/sitemap.xml", "/compare/", "/compare/before.html"]) {
    const response = await fetch("http://127.0.0.1:" + port + route);
    assert.equal(response.status, 200, route);
  }
  assert.equal((await fetch("http://127.0.0.1:" + port + "/../README.md")).status, 404);
});

test("homepage leads with Site Rescue and an email-only process", () => {
  build();
  const html = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
  const h1 = html.match(/<h1[\s\S]*?<\/h1>/)[0].replace(/<[^>]+>/g, "");
  assert.match(h1, /I fix small business websites/);
  assert.doesNotMatch(h1, /underperforming/);
  assert.match(html, /Site Rescue/);
  assert.match(html, /\$149/);
  assert.equal((html.match(/comes off the fix/g) || []).length, 2);
  assert.match(html, /three days/);
  assert.match(html, /Handled entirely by email/);
  assert.match(html, /No sales calls/);
  assert.match(html, /made-up cleaning company/);
  assert.match(html, /You own every account and login from day one/);
  assert.doesNotMatch(html, /\[placeholder/);
  assert.match(html, /My wife and I ran a company\. We paid a developer/);
  assert.doesNotMatch(html, /3 million/);
  assert.doesNotMatch(html, /valued at/);
  assert.doesNotMatch(html, /Free%2020-minute%20call/);
  assert.doesNotMatch(html, /Best%20time%20to%20call/);
  assert.doesNotMatch(html, /Twenty minutes on a call/);
  assert.doesNotMatch(html, /what the call is for/);
  const dollars = html.match(/\$\d[\d,]*/g) || [];
  assert.ok(dollars.includes("$149"));
  for (const amount of dollars) assert.equal(amount, "$149", "Unexpected price " + amount);
  const other = html.slice(html.indexOf('id="other"'), html.indexOf('id="faq"'));
  assert.match(other, /Help beyond the website/);
  for (const service of ["Tech support", "A one-off automation", "Set up your whole workflow", "Ongoing support"]) {
    assert.equal((other.match(new RegExp(service, "g")) || []).length, 1, service);
  }
  assert.doesNotMatch(other, /\$|tier__|Start here|per issue|\/mo/);
  assert.doesNotMatch(html, />Pricing</);
  const mailtos = Array.from(html.matchAll(/href="(mailto:[^"]+)"/g), (match) => match[1]);
  assert.ok(mailtos.length >= 4, "Expected the Site Rescue mailtos and the plain address");
  let rescueSubjects = 0;
  let otherSubjects = 0;
  for (const href of mailtos) {
    assert.match(href, /^mailto:joedavini23@gmail\.com/);
    if (href.includes("subject=Site%20Rescue")) {
      rescueSubjects += 1;
      const body = decodeURIComponent(href.split("body=")[1] || "");
      for (const line of ["Business name:", "Website:", "What you sell:", "The one thing bugging you:", "What you want to happen:", "What you have tried:", "Rough budget:", "Deadline:"]) {
        assert.ok(body.includes(line), "Mailto template is missing " + line);
      }
    } else if (href.includes("subject=")) {
      otherSubjects += 1;
      assert.match(href, /subject=Other%20work/);
      assert.doesNotMatch(href, /Site%20Rescue/);
    }
    assert.doesNotMatch(href, /20-minute|sales%20call|time%20to%20call/i);
  }
  assert.equal(rescueSubjects, 2);
  assert.equal(otherSubjects, 1);
  const css = fs.readFileSync(path.join(DIST, "assets", "site.css"), "utf8");
  assert.doesNotMatch(css, /\.brand__word\{\s*display:\s*none/);
  assert.doesNotMatch(css, /\.tier__price|\.tiers\{|\.fixit\{|\.pricing__cta|\.tick /);
  const reveals = fs.readFileSync(path.join(DIST, "assets", "js", "reveals.js"), "utf8");
  assert.doesNotMatch(reveals, /\.tier/);
  const how = html.slice(html.indexOf('id="how"'), html.indexOf('id="about"'));
  assert.match(how, /Email the website/);
  assert.match(how, /under five minutes/);
  assert.match(how, /One page, in plain English/);
  assert.match(how, /Findings ranked by what they cost/);
  assert.match(how, /The first fix I would do/);
  assert.match(how, /never hourly/);
  assert.match(how, /50% up front/);
  assert.equal((how.match(/comes off the fix/g) || []).length, 1);
  assert.match(how, /You own every account and login from day one/);
  assert.doesNotMatch(how, /three days/);
  assert.doesNotMatch(how, /by email/i);
  assert.doesNotMatch(how, /\[placeholder/);
  const steps = [...how.matchAll(/<article class="step[\s\S]*?<\/article>/g)].map((match) => match[0]);
  assert.equal(steps.length, 3);
  for (const step of steps) {
    const bullets = step.match(/<li>/g) || [];
    assert.ok(bullets.length >= 1 && bullets.length <= 4, "Each step needs 1 to 4 bullets, got " + bullets.length);
  }
  for (const amount of how.match(/\$[\d,]+/g) || []) assert.equal(amount, "$149", "How it works quotes " + amount);
});

test("build publishes robots.txt and sitemap.xml", () => {
  build();
  const robots = fs.readFileSync(path.join(DIST, "robots.txt"), "utf8");
  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.match(robots, /^Sitemap: https:\/\/joe-solves-tech\.vercel\.app\/sitemap\.xml$/m);
  const sitemap = fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
  const locs = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
  assert.deepEqual(locs, [
    "https://joe-solves-tech.vercel.app/",
    "https://joe-solves-tech.vercel.app/demo/"
  ]);
});

test("mailto clicks record contact_cta_click with the subject", () => {
  const events = [];
  const listeners = [];
  const context = vm.createContext({
    URLSearchParams,
    window: {
      gtag(command, name, parameters) { events.push({ command, name, parameters }); }
    },
    document: {
      addEventListener(type, handler) { listeners.push({ type, handler }); }
    }
  });
  const source = fs.readFileSync(path.join(__dirname, "../src/scripts/analytics.js"), "utf8")
    .replace("export function initAnalytics", "function initAnalytics");
  vm.runInContext(source + "\ninitAnalytics();", context);
  assert.equal(listeners.length, 1);

  function click(href, text, sectionId) {
    const link = {
      getAttribute(name) { return name === "href" ? href : null; },
      textContent: text,
      closest(selector) {
        if (selector.includes("section")) return { id: sectionId, tagName: "SECTION" };
        return null;
      }
    };
    listeners[0].handler({
      target: {
        closest(selector) { return selector === "a[href]" ? link : null; }
      }
    });
  }

  click("mailto:joedavini23@gmail.com?subject=Site%20Rescue&body=Hi", "Email me about Site Rescue", "contact");
  click("mailto:joedavini23@gmail.com?subject=Other%20work&body=Hi", "Email me", "other");
  click("mailto:joedavini23@gmail.com", "joedavini23@gmail.com", "contact");
  click("#contact", "Get in touch", "nav");
  click("#work", "Work", "nav");

  const clicks = events.filter((event) => event.name === "contact_cta_click");
  const leads = events.filter((event) => event.name === "generate_lead");
  assert.deepEqual(clicks.map((event) => event.parameters.mailto_subject), ["Site Rescue", "Other work", ""]);
  assert.deepEqual(clicks.map((event) => event.parameters.link_location), ["contact", "other", "contact"]);
  assert.equal(clicks[0].parameters.link_text, "Email me about Site Rescue");
  assert.equal(leads.length, 3);
  assert.equal(leads[0].parameters.method, "email");
  assert.equal("mailto_subject" in leads[0].parameters, false);
  assert.equal(events.length, 6);

  context.window = {};
  click("mailto:joedavini23@gmail.com?subject=Site%20Rescue", "Email me about Site Rescue", "contact");
  assert.equal(events.length, 6);
});
