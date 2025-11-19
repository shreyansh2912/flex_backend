const express = require("express");
const router = express.Router();
const formController = require("../controllers/form.controller");

router.get("/", formController.getForms);
router.post("/", formController.createForm);
router.get("/:id", formController.getFormById);
router.put("/:id", formController.updateForm);
router.delete("/:id", formController.deleteForm);

module.exports = router;