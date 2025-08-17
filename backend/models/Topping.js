const mongoose = require("mongoose");

const toppingSchema = new mongoose.Schema({
  collectionName: { type: String, required: true },
  toppings: [
    {
      name: { type: String, required: true },
      description: { type: String },
      image: { type: String }, // URL or path to topping image
      prices: [
        {
          size: { type: String, required: true },
          price: { type: Number, required: true },
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Topping", toppingSchema);
