const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    userOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        default: null,
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
        type: Boolean
    },
    image: {
        type: String,
        default: null
    }
},
{
timestamps: true
});

const Category = mongoose.model("category", categorySchema);

module.exports = Category;
