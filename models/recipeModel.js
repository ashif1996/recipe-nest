const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
        required: true,
    },
    preparationTime: {
        type: String,
        required: true,
    },
    servingSize: {
        type: String,
        required: true,
    },
    ingrediants: {
        type: [String],
        required: true,
    },
    steps: {
        type: [String],
        required: true,
    },
    similarRecipes: [
        {
            type: Schema.Types.ObjectId,
            ref: "Recipe",
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

recipeSchema.pre("save", async function(next) {
    if (this.isNew) {
        const similarRecipes = await this.constructor.find({
            category: this.category,
            _id: { $ne: this.id },
        }).limit(4);

        this.similarRecipes = similarRecipes.map(recipe => recipe._id);
    }

    next();
});

const Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = Recipe;