document.addEventListener("DOMContentLoaded", () => {
    const categoryForm = document.getElementById("categoryForm");

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

    const validateCategoryForm = () => {
        const categoryName = document.getElementById("categoryName").value.trim();
        const description = document.getElementById("description").value.trim();
        const image = document.getElementById("image").files[0];

        let isValid = true;

        clearErrors();
    
        if (categoryName === "") {
            displayErrors("categoryName", "Category name is required.");
            isValid = false;
        } else if (/^\d+$/.test(categoryName)) {
            displayErrors("categoryName", "Category name cannot be just numbers.");
            isValid = false;
        }
    
        if (description === "") {
            displayErrors("description", "Description is required.");
            isValid = false;
        } else if (description.length < 10) {
            displayErrors("description", "Description must be at least 10 characters long.");
            isValid = false;
        }
    
        if (!image) {
            displayErrors("image", "An image file is required.");
            isValid = false;
        } else if (!image.type.startsWith("image/")) {
            displayErrors("image", "Only image files are allowed.");
            isValid = false;
        } else if (image.size > 5 * 1024 * 1024) {
            displayErrors("image", "Image size should not exceed 5MB.");
            isValid = false;
        }
    
        return isValid;
    };    

    if (categoryForm) {
        document.addEventListener("submit", (event) => {
            event.preventDefault();

            const isValidCategoryForm = validateCategoryForm();
            if (isValidCategoryForm) {
                categoryForm.submit();
            }
        });
    }
});