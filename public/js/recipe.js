document.addEventListener("DOMContentLoaded", () => {
    const recipeForm = document.getElementById("recipeForm");

    const displayErrors = (fieldId, message) => {
        const errorElement = document.getElementById(`${fieldId}Error`);
        const inputElement = document.getElementById(fieldId);

        if (errorElement) {
            errorElement.textContent = message;
        }

        if (inputElement) {
            inputElement.classList.add('error-border');
        }
    };

    const clearErrors = () => {
        document.querySelectorAll('.error-message').forEach((error) => {
            error.textContent = '';
        });

        document.querySelectorAll('.error-border').forEach((input) => {
            input.classList.remove('error-border');
        });
    };

    const validateRecipeForm = () => {
        const recipeName = document.getElementById("recipeName").value.trim();
        const category = document.getElementById("category").value;
        const image = document.getElementById("image").files[0];
        const preparationTime = document.getElementById("preparationTime").value.trim();
        const servingSize = document.getElementById("servingSize").value.trim();
        const ingredients = document.getElementById("ingredients").value.trim();
        const steps = document.getElementById("steps").value.trim();

        clearErrors();

        let isValid = true;

        if (!recipeName) {
            displayErrors("recipeName", "Recipe Name is required.");
            isValid = false;
        }

        if (!category) {
            displayErrors("category", "Category is required.");
            isValid = false;
        }

        if (!image) {
            displayErrors("image", "Recipe image is required.");
            isValid = false;
        } else if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(image.type)) {
            displayErrors("image", "Only PNG, JPEG, JPG, and WEBP formats are allowed.");
            isValid = false;
        }

        if (!preparationTime || isNaN(preparationTime) || preparationTime <= 0) {
            displayErrors("preparationTime", "Valid preparation time (in minutes) is required.");
            isValid = false;
        }

        if (!servingSize || isNaN(servingSize) || servingSize <= 0) {
            displayErrors("servingSize", "Valid serving size is required.");
            isValid = false;
        }

        if (!ingredients) {
            displayErrors("ingredients", "At least one ingredient is required.");
            isValid = false;
        }

        if (!steps) {
            displayErrors("steps", "At least one preparation step is required.");
            isValid = false;
        }

        return isValid;
    };

    if (recipeForm) {
        recipeForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const isValidRecipeForm = validateRecipeForm();
            if (isValidRecipeForm) {
                recipeForm.submit();
            }
        });
    }
});