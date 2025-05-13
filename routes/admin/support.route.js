const express = require ("express");
const router = express.Router();
const adminSupportcontroller =  require ("../../controllers/admin/support.controller")

router.get("/", adminSupportcontroller.support)

router.post("/reply", adminSupportcontroller.replySupport); 

module.exports = router;
