const express = require("express");
const router = express.Router();
const formController = require("../controllers/form.controller");
const authMiddleware = require("../middlewares/authMiddleware");

// Protected Routes
router.get("/", authMiddleware, formController.getForms);
router.post("/", authMiddleware, formController.createForm);
router.put("/:id", authMiddleware, formController.updateForm);
router.delete("/:id", authMiddleware, formController.deleteForm);
router.get("/:formId/submissions", authMiddleware, formController.getFormSubmissions);

// Public Routes
router.get("/:id", formController.getFormById); // Public access to form details
router.post("/:formId/submit", formController.submitResponse); // Public submission

module.exports = router;