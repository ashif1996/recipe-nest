const getUserLogin = (req, res) => {
    const locals = { title: "User Login | RecipeNest" };
    return res.status(200).render("login", {
        locals,
        layout: "layouts/authLayout",
    });
};

module.exports = {
    getUserLogin,
}