const mongoose = require("mongoose");

const toppingSchema = new mongoose.Schema({
  collectionName: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  toppings: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      name: { type: String, required: true },
      description: { type: String },
      image: { type: String }, // URL or path to topping image
      prices: [
        {
          _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
          size: { type: String, required: true },
          price: { type: Number, required: true },
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Topping", toppingSchema);
