import fs from "fs";
import { ObjectId } from "mongodb";

function addIdsToToppings(toppingsData) {
  return toppingsData.map((collection) => ({
    ...collection,
    toppings: collection.toppings.map((topping) => ({
      ...topping,
      _id: new ObjectId(),
      prices: topping.prices.map((price) => ({
        ...price,
        _id: new ObjectId(),
      })),
    })),
  }));
}

function addIdsToCakes(cakesData, toppingsCollections) {
  // Assign a random topping collection _id to each cake's toppingRef
  return cakesData.map((cake) => ({
    ...cake,
    prices: cake.prices.map((price) => ({
      ...price,
      _id: new ObjectId(),
    })),
    toppingRef:
      toppingsCollections.length > 0
        ? toppingsCollections[
            Math.floor(Math.random() * toppingsCollections.length)
          ]._id
        : undefined,
  }));
}

// Read and update toppings
const toppingsPath = "./toppings.json";
const cakesPath = "./Sweet_Heaven.cakes.new.json";
const toppingsData = JSON.parse(fs.readFileSync(toppingsPath));
const toppingsWithIds = addIdsToToppings(toppingsData);

// Assign _id to each toppings collection for referencing
for (const col of toppingsWithIds) {
  col._id = new ObjectId();
}

// Read and update cakes
const cakesData = JSON.parse(fs.readFileSync(cakesPath));
const cakesWithIds = addIdsToCakes(cakesData, toppingsWithIds);

// Write updated files
fs.writeFileSync(
  "./toppings.updated.json",
  JSON.stringify(toppingsWithIds, null, 2)
);
fs.writeFileSync(
  "./Sweet_Heaven.cakes.updated.json",
  JSON.stringify(cakesWithIds, null, 2)
);

console.log(
  "Updated files written: toppings.updated.json, Sweet_Heaven.cakes.updated.json"
);
