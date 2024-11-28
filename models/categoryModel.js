const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema for storing Recipe categories
const categorySchema = new Schema({
    categoryName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 50,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300,
    },
    image: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;