const getHome = (req, res) => {
    const locals = { title: "Home | RecipeNest" };
    return res.render("index", {
        locals,
        layout: "layouts/mainLayout",
    });
};

module.exports = {
    getHome,
}