document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const isValidateLoginForm = validateLoginForm();
            if (isValidateLoginForm) {
                processLoginSubmit();
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const isValidateSignupForm = validateSignupForm();
            if (isValidateSignupForm) {
                processSignupSubmit();
            }
        });
    }
});