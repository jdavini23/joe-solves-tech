"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");
const INCLUDE = /<!--\s*@include\s+"([^"]+)"\s*-->/g;
const CSS_FILES = [
  "01-tokens.css",
  "02-base.css",
  "03-buttons.css",
  "04-navigation.css",
  "05-hero.css",
  "06-section-header.css",
  "07-work.css",
  "08-statistics.css",
  "09-about.css",
  "10-contact.css",
  "11-footer.css",
  "12-progress.css",
  "13-hero-media.css",
  "14-process.css",
  "15-pricing.css",
  "16-offer.css",
  "17-reviews.css",
  "18-guarantee.css",
  "19-faq.css",
  "20-sticky-bar.css",
  "21-nudge.css",
  "22-button-motion.css",
  "23-reveal-and-reduced-motion.css"
];

function isInside(file, directory) {
  return file.startsWith(directory + path.sep);
}

function renderTemplate(template, ancestry = []) {
  return template.replace(INCLUDE, (_directive, relativePath) => {
    const target = path.resolve(SRC, relativePath);
    const partials = path.join(SRC, "partials");
    const sections = path.join(SRC, "sections");
    if (!isInside(target, partials) && !isInside(target, sections)) {
      throw new Error("Include is outside approved directories: " + relativePath);
    }
    if (ancestry.includes(target)) throw new Error("Circular include: " + relativePath);
    if (!fs.existsSync(target)) throw new Error("Missing include: " + relativePath);
    return renderTemplate(fs.readFileSync(target, "utf8").trim(), ancestry.concat(target));
  });
}

function copyDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) copyDirectory(from, to);
    else if (entry.isFile()) fs.copyFileSync(from, to);
  }
}

function build() {
  const template = fs.readFileSync(path.join(SRC, "index.html"), "utf8");
  const html = renderTemplate(template);
  if (INCLUDE.test(html)) throw new Error("Unresolved include directive in generated HTML");
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(path.join(DIST, "assets"), { recursive: true });
  fs.writeFileSync(path.join(DIST, "index.html"), html.trim() + "\n");
  const css = CSS_FILES.map((file) => fs.readFileSync(path.join(SRC, "styles", file), "utf8").trim()).join("\n\n") + "\n";
  fs.writeFileSync(path.join(DIST, "assets", "site.css"), css);
  copyDirectory(path.join(SRC, "scripts"), path.join(DIST, "assets", "js"));
  const staticDirectory = path.join(SRC, "static");
  if (fs.existsSync(staticDirectory)) copyDirectory(staticDirectory, DIST);
  return DIST;
}

if (require.main === module) {
  build();
  console.log("Built " + path.relative(ROOT, DIST));
}
module.exports = { build, renderTemplate, DIST, ROOT };
