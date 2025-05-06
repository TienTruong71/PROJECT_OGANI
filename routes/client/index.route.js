const productRoute = require("./product.route")
const homeRoute = require("./home.route")
const searchRoute = require("./search.route")
const catalogRoute = require("./catalog.route")
const cartRoute = require("./cart.route")
const infoRoute = require("./info.route")
const orderRoute = require("./order.route")

function routeClient(app) {

    app.use("/product", productRoute);
    app.use("/cart", cartRoute);
    app.use("/info", infoRoute);
    app.use("/order", orderRoute);
    app.use("/", homeRoute);
    app.use("/", searchRoute);
    app.use('/catalog', catalogRoute); // Gắn route với path gốc
}

module.exports = routeClient;