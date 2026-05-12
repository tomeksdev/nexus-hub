import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const forbidden = [/https?:\/\/cdn\./i, /cdn.jsdelivr/i, /cdnjs/i, /unpkg/i];
const allowedExtensions = new Set([".html", ".md", ".yml", ".css", ".js"]);
const ignored = new Set(["node_modules", "_site", ".jekyll-cache", "assets/vendor", "vendor"]);

const files = [];

const walk = (directory) => {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if ([...ignored].some((ignore) => path === ignore || path.startsWith(`${ignore}/`))) {
      continue;
    }

    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path);
      continue;
    }

    const extension = path.slice(path.lastIndexOf("."));
    if (allowedExtensions.has(extension)) {
      files.push(path);
    }
  }
};

walk(".");

const failures = [];

for (const file of files) {
  const content = readFileSync(file, "utf8");
  for (const pattern of forbidden) {
    if (pattern.test(content)) {
      failures.push(`${file}: ${pattern}`);
    }
  }
}

if (failures.length) {
  console.error("CDN references found:\n" + failures.join("\n"));
  process.exit(1);
}

console.log("No CDN references found.");
