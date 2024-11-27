document.addEventListener("DOMContentLoaded", () => {
    const favouriteLink = document.getElementById("add-to-favourite");

    if (favouriteLink) {
        favouriteLink.addEventListener("click", async (event) => {
            event.preventDefault();

            const recipeId = favouriteLink.getAttribute("data-recipe-id");

            try {
                const response = await fetch("/users/add-favourites", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include", // Ensures cookies are sent
                    body: JSON.stringify({ recipeId }),
                });

                const result = await response.json(); // Parse the JSON response

                if (response.status === 401) {
                    // Handle 401 Unauthorized response (for logged-out users)
                    Swal.fire({
                        icon: 'info',
                        title: 'Error',
                        text: result.message,
                        confirmButtonText: 'OK',
                    }).then(() => {
                        window.location.href = "/users/login";  // Redirect to login page
                    });
                    return;
                }

                if (result.ok) {
                    // Success case
                    Swal.fire({
                        icon: 'success',
                        title: result.message,
                        confirmButtonText: 'OK',
                    });
                } else {
                    // Error case
                    Swal.fire({
                        icon: 'info',
                        title: 'Error',
                        text: result.message,
                        confirmButtonText: 'OK',
                    });
                }

            } catch (error) {
                console.error("Error adding recipe to favorites:", error);

                // Handle errors from the fetch call (network errors, etc.)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: "An error occurred while adding the recipe to favorites.",
                    confirmButtonText: 'OK',
                });
            }
        });
    }
});