#!/usr/bin/env node
// Script to update all API files to use the new apiConfig

const fs = require("fs");
const path = require("path");

const apiDir = path.join(__dirname, "..", "src", "api");
const files = fs.readdirSync(apiDir).filter((file) => file.endsWith(".js"));

files.forEach((file) => {
  const filePath = path.join(apiDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // Add import if not already present
  if (!content.includes("createApiUrl")) {
    content = `import { createApiUrl } from '../utils/apiConfig.js';\n${content}`;
  }

  // Replace fetch calls
  content = content.replace(/fetch\("\/api\//g, 'fetch(createApiUrl("/api/');
  content = content.replace(/fetch\(`\/api\//g, "fetch(createApiUrl(`/api/");

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});

console.log("All API files updated!");
