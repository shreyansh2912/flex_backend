const Form = require('../models/form.model');
const { successJson, errorJson } = require('../utils/responseHelpers');

exports.getForms = async (req, res) => {
  try {
    const forms = await Form.find();
    return successJson(res, forms, 'Fetched all forms');
  } catch (error) {
    return errorJson(res, error.message, 500);
  }
};

exports.createForm = async (req, res) => {
  try {
    const { title, description, steps } = req.body;
    const userId = req.user._id;

    const form = new Form({
      title,
      description,
      steps,
      userId, // Attach the userId to the form
    });

    await form.save();

    return successJson(res, form, 'Form created', 201);
  } catch (error) {
    return errorJson(res, error.message, 400);
  }
};


exports.updateForm = async (req, res) => {
  try {
    const { id, title, description } = req.body;
    const form = await Form.findByIdAndUpdate(
      id,
      { title, description },
      { new: true, runValidators: true }
    );
    if (!form) {
      return errorJson(res, 'Form not found', 404);
    }
    return successJson(res, form, 'Form updated');
  } catch (error) {
    return errorJson(res, error.message, 400);
  }
};

exports.deleteForm = async (req, res) => {
  try {
    const { id } = req.body;
    const form = await Form.findByIdAndDelete(id);
    if (!form) {
      return errorJson(res, 'Form not found', 404);
    }
    return successJson(res, null, 'Form deleted');
  } catch (error) {
    return errorJson(res, error.message, 400);
  }
};