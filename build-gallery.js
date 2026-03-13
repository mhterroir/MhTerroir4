// build-gallery.js
// Run with: node build-gallery.js

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SECTIONS_DIR = path.join(ROOT, "assets", "sections");
const OUTPUT_FILE = path.join(ROOT, "sections.json");

// Simple helper: allowed image extensions
const IMAGE_EXTS = new Set([".avif", ".jpg", ".jpeg", ".png", ".webp"]);

function isImageFile(file) {
  const ext = path.extname(file).toLowerCase();
  return IMAGE_EXTS.has(ext);
}

function buildConfig() {
  const sections = [];

  if (!fs.existsSync(SECTIONS_DIR)) {
    console.error("Missing assets/sections/ folder");
    return sections;
  }

  const sectionFolders = fs
    .readdirSync(SECTIONS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  sectionFolders.forEach((folderName) => {
    const folderPath = path.join(SECTIONS_DIR, folderName);
    const files = fs
      .readdirSync(folderPath, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .filter(isImageFile)
      .sort();

    const section = {
      id: folderName,
      label: folderName,
      description: "",
      folder: `assets/sections/${folderName}/`,
      images: files
    };

    sections.push(section);
  });

  return sections;
}

function main() {
  const config = buildConfig();
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(config, null, 2), "utf8");
  console.log(
    `Wrote ${config.length} sections to ${path.relative(ROOT, OUTPUT_FILE)}`
  );
}

main();
