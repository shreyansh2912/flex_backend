const Form = require('../models/form.model');
const { successJson, errorJson } = require('../utils/responseHelpers');

exports.getForms = async (req, res) => {
  try {
    const forms = await Form.find({ userId: req.user._id });
    return successJson(res, forms, 'Fetched all forms');
  } catch (error) {
    return errorJson(res, error.message, 500);
  }
};

exports.createForm = async (req, res) => {
  try {
    console.log('Create form request body:', req.body);
    console.log('User ID:', req.user._id);
    const { title, formType, isPublic, fields } = req.body;
    const userId = req.user._id;

    const form = new Form({
      title,
      formType,
      isPublic,
      fields,
      userId, // Attach the userId to the form
    });

    await form.save();

    return successJson(res, form, 'Form created', 201);
  } catch (error) {
    console.error('Error creating form:', error);
    return errorJson(res, error.message, 400);
  }
};


exports.getFormById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return errorJson(res, 'Form not found', 404);
    }
    return successJson(res, form, 'Form fetched');
  } catch (error) {
    return errorJson(res, error.message, 500);
  }
};

exports.updateForm = async (req, res) => {
  try {
    const { title, formType, isPublic, fields } = req.body;
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { title, formType, isPublic, fields },
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
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) {
      return errorJson(res, 'Form not found', 404);
    }
    return successJson(res, null, 'Form deleted');
  } catch (error) {
    return errorJson(res, error.message, 400);
  }
};