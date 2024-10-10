const mongoose = require("mongoose");

const attributeSchema = new mongoose.Schema({
    userOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    unique_name: {
        type: String
    },
    public_name: {
        type: String
    },
    type: {
        type: String
    },
    publish: {
        type: Boolean,
        default: true
    },
    valuesOwner: [{type: mongoose.Schema.Types.ObjectId, ref: 'attribute_value'}]
},
{
timestamps: true
});

const Attribute = mongoose.model("attribute", attributeSchema);

module.exports = Attribute;
