const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  options: [{
    attributeOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'attribute'},
    values: {
      type: [String], // Assuming values are numbers based on your example
      default: []
    }
  }],
  categoryOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
  // variantsOwner: [{ type: mongoose.Schema.Types.ObjectId, ref: 'variant', default: [] }],
  variantsOwner: Array,
  userOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
  },
  slug: {
    type: String,
  },
  description: {
    type: String,
    required: false,
  },
  prices: {
    originalPrice: Number,
    salePrice: Number,
    discount: Number,
  },
  media: {
    images: [String], // Assuming images are stored as strings (e.g., URLs)
  },
  searchEngineOptimize: {
    metaTitle: String,
    metaKeywords: String,
    metaDescription: String,
  },
  status: {
    type: Boolean,
    default: true,
  },
  publish: {
    type: Boolean,
    default: true,
  },
  quantity: {
    type: Number,
  },
}, {
  timestamps: true
});

const Product = mongoose.model("product", productSchema);

module.exports = Product;
