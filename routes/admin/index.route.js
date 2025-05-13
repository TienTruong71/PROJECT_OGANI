const systemConfig = require ("../../config/system")
const cateRoute = require ("./category.route")
const orderRoute = require ("./order.route")
const customerRoute = require ("./customer.route")
const staffRoute = require ("./staff.route")
const supportRoute = require ("./support.route")

const productRoute = require("./product.route");
const { checkAdminRole } = require("../../middleware/role.middleware"); // Import middleware kiểm tra quyền admin

function routeAdmin(app) {
    const PATH_ADMIN = systemConfig.prefixAdmin;

    app.use(PATH_ADMIN, checkAdminRole);

    app.use(PATH_ADMIN + "/order", orderRoute);
    
    app.use(PATH_ADMIN + "/category", cateRoute);

    app.use(PATH_ADMIN + "/staff", staffRoute);

    app.use(PATH_ADMIN + "/customer", customerRoute);
    
    app.use(PATH_ADMIN + "/product", productRoute);

    app.use(PATH_ADMIN + "/support", supportRoute);


     app.use(PATH_ADMIN, cateRoute);


}

module.exports = routeAdmin
