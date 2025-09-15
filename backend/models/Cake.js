const mongoose = require("mongoose");

const cakeSchema = new mongoose.Schema({
  cakeName: {
    type: String,
    required: true,
  },
  cakeDescription: {
    type: String,
    required: true,
  },
  detailedDescription: {
    type: String,
  },
  prices: [
    {
      // use the lowercase size string as the id for each price (e.g. "small")
      _id: { type: String },
      size: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
  toppingRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topping",
    required: false,
  },
  // Keep single cakeImage for backward compatibility, but prefer `images` array
  cakeImage: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    required: false,
    default: undefined,
  },
  category: {
    type: String,
    required: true,
  },
  // true => this category uses size-based pricing (prices array). false => single price stored in `price`.
  priceBasedPricing: {
    type: Boolean,
    default: false,
  },
  // single price when size-based pricing is not used
  price: {
    type: Number,
    required: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
});

// Ensure each price subdocument _id is the lowercase size string before validation/save.
cakeSchema.pre("validate", function (next) {
  if (this.prices && Array.isArray(this.prices)) {
    this.prices.forEach((p) => {
      if (p && p.size) {
        // normalize to lowercase string for the id
        try {
          p._id = String(p.size).toLowerCase();
        } catch (e) {
          // leave _id unchanged if conversion fails
        }
      }
    });
  }
  next();
});

module.exports = mongoose.model("Cake", cakeSchema);
