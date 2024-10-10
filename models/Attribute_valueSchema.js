const mongoose = require("mongoose");

const attribute_valueSchema = new mongoose.Schema({
    // attributeOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'attributes'},
    name: {
        type: String
    },
    color: {
        type: String,
    }
},
{
timestamps: true
});

const AttributeValue = mongoose.model("attribute_value", attribute_valueSchema);

module.exports = AttributeValue;
