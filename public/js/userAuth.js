document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

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

    const isValidEmail = (email) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    };

    const validateLoginForm = () => {
        const loginEmail = document.getElementById('loginEmail').value.trim();
        const loginPassword = document.getElementById('loginPassword').value.trim();

        let isValid = true;

        clearErrors();

        if (!loginEmail) {
            displayErrors("loginEmail", "Email is required.");
            isValid = false;
        } else if (!isValidEmail(loginEmail)) {
            displayErrors("loginEmail", "Enter a valid email.");
            isValid = false;
        }

        if (!loginPassword) {
            displayErrors("loginPassword", "Password is required.");
            isValid = false;
        } else if (loginPassword.length < 8) {
            displayErrors("loginPassword", "Password must be atleast 8 characters.");
            isValid = false;
        }

        return isValid;
    }

    const validateSignupForm = () => {
        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        let isValid = true;

        clearErrors();

        if (firstName === '') {
            displayErrors("firstName", "First name is required.");
            isValid = false;
        } else if (firstName.length < 3 || firstName.length > 15) {
            displayErrors("firstName", "First name must be between 3 and 15 characters long.");
            isValid = false;
        } else if (!/^[a-zA-Z]+$/.test(firstName)) {
            displayErrors("firstName", "Please enter a valid first name. Only letters are allowed.");
            isValid = false;
        }

        if (lastName === '') {
            displayErrors("lastName", "Last name is required.");
            isValid = false;
        } else if (lastName.length < 3 || lastName.length > 15) {
            displayErrors("lastName", "Last name must be between 3 and 15 characters long.");
            isValid = false;
        } else if (!/^[a-zA-Z]+$/.test(lastName)) {
            displayErrors("lastName", "Please enter a valid last name. Only letters are allowed.");
            isValid = false;
        }

        if (email === '') {
            displayErrors("email", "Email is required.");
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            displayErrors("email", "Please enter a valid email address.");
            isValid = false;
        }

        if (password === '') {
            displayErrors("password", "Password is required.");
            isValid = false;
        } else if (password.length < 8) {
            displayErrors("password", "Password must be at least 8 characters long.");
            isValid = false;
        }

        if (confirmPassword === '') {
            displayErrors("confirmPassword", "Please confirm your password.");
            isValid = false;
        } else if (confirmPassword.length < 8) {
            displayErrors("confirmPassword", "Password must be at least 8 characters long.");
            isValid = false;
        } else if (password !== confirmPassword) {
            displayErrors("confirmPassword", "Passwords do not match.");
            isValid = false;
        }

        return isValid;
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const isValidateLoginForm = validateLoginForm();
            if (isValidateLoginForm) {
                loginForm.submit();
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const isValidateSignupForm = validateSignupForm();
            if (isValidateSignupForm) {
                signupForm.submit();
            }
        });
    }
});