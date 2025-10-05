const express = require("express");
const router = express.Router();

const formController = require("../controllers/form.controller");

router.get("/",formController.getForm);
router.post("/create",formController.createForm);
router.post("/update",formController.updateForm);
router.post("/delete",formController.deleteForm);