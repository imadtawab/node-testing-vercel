const mongoose = require("mongoose");

const attributeSchema = new mongoose.Schema({
    userId: {
        type: String
    },
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
        type: String
    },
    values: {
        type: Array
    }
},
{
timestamps: true
});

const attributes = mongoose.model("attribute", attributeSchema);

module.exports = attributes;
