const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    userId: {
        type: String
    },
    name: {
        type: String
    },
    slug: {
        type: String
    },
    description: {
        type: String
    },
    publish: {
        type: String
    },
    image: {
        type: String
    }
},
{
timestamps: true
});

const categories = mongoose.model("categorie", categorySchema);

module.exports = categories;
