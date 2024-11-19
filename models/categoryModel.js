const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
        validate: {
            validator: (img) => {
                return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(img);
            },
            message: "Invalid image URL format",
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;