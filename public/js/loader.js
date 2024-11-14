document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("loader");
    loader.classList.add("hidden");
});

window.addEventListener("beforeunload", () => {
    const loader = document.getElementById("loader");
    loader.classList.remove("hidden");
});