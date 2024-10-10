const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
    productOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'product'},
    image: {
        type: String
    },
    option_array: {
        type: Array
    },
    prices: {
        originalPrice: Number,
        salePrice: Number,
        discount: Number,
      },
      quantity: {
        type: Number,
      },
      sku: {
        type: String,
      },
},
{
timestamps: true
});

const Variant = mongoose.model("variant", variantSchema);

module.exports = Variant;
