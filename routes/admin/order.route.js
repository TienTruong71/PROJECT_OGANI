const express = require ("express");
const router = express.Router();
const AdminOrdercontroller =  require ("../../controllers/admin/order.controller")

router.get("/", AdminOrdercontroller.order)
router.post("/:id/status", AdminOrdercontroller.updateOrderStatus)
router.get("/:id",AdminOrdercontroller.getOrderDetail)
router.post("/apply-bulk-action", AdminOrdercontroller.applyBulkAction);

module.exports = router;
