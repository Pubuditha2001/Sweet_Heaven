// randomize-toppingRef.js
import fs from "fs";
import { ObjectId } from "mongodb";
const file =
  "E:/Web Projects/Sweet_Heaven/frontend/database Data/Sweet_Heaven.cakes.updated.json";

const ids = [
  "68a3967239e62649e36169fb",
  "68a3967239e62649e36169fc",
  "68a3967239e62649e36169fd",
  "68a3967239e62649e36169fe",
];

// make a backup
fs.copyFileSync(file, file + ".bak");

const raw = fs.readFileSync(file, "utf8");
const data = JSON.parse(raw);

if (!Array.isArray(data)) {
  throw new Error("Expected top-level array in JSON file.");
}

data.forEach((item) => {
  // only set toppingRef (add if missing)
  item.toppingRef = ids[Math.floor(Math.random() * ids.length)];
});

fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
console.log("toppingRef values randomized. Backup created at", file + ".bak");
