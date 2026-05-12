import { copyFileSync, cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname } from "node:path";

const files = [
  ["node_modules/bootstrap/dist/css/bootstrap.min.css", "assets/vendor/bootstrap/css/bootstrap.min.css"],
  ["node_modules/bootstrap/dist/js/bootstrap.bundle.min.js", "assets/vendor/bootstrap/js/bootstrap.bundle.min.js"],
  ["node_modules/@fortawesome/fontawesome-free/css/all.min.css", "assets/vendor/fontawesome/css/all.min.css"]
];

rmSync("assets/vendor", { recursive: true, force: true });

for (const [source, target] of files) {
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
}

cpSync("node_modules/@fortawesome/fontawesome-free/webfonts", "assets/vendor/fontawesome/webfonts", {
  recursive: true
});

console.log("Vendored Bootstrap and Font Awesome assets.");
