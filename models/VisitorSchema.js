const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({
  visits: {
    type: [{
      type: Date,
      default: Date.now()
    }],
    default: []
  },
  userId: {
    type: String,
    required: true
  }
});

const Visitor = mongoose.model("visitor", visitorSchema);

module.exports = Visitor;