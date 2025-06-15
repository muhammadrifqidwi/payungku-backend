const router = require("express").Router();
const locCtrl = require("../controllers/locationController");

router.get("/", locCtrl.getLocations);
router.post("/", locCtrl.createLocation);
router.put("/:id", locCtrl.updateLocation);
router.get("/:id", locCtrl.getLocationById);

module.exports = router;
