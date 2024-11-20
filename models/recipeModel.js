const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    recipeName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
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
    ingredients: {
        type: [String],
        required: true,
        validate: {
            validator : (val) => {
                return val.length > 0;
            },
            message: "Ingrediants cannot be empty",
        },
    },
    steps: {
        type: [String],
        required: true,
        validate: {
            validator : (val) => {
                return val.length > 0;
            },
            message: "Steps cannot be empty",
        },
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