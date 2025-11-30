const Form = require('../models/form.model');
const Submission = require('../models/submission.model');
const { successJson, errorJson } = require('../utils/responseHelpers');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcrypt');

exports.getForms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const forms = await Form.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return successJson(res, forms, 'Fetched all forms');
  } catch (error) {
    return errorJson(res, error.message, 500);
  }
};

exports.createForm = async (req, res) => {
  try {
    console.log('Create form request body:', req.body);
    console.log('User ID:', req.user._id);
    const { title, formType, isPublic, fields, theme, visibility, password, allowedEmails, collectUserInfo } = req.body;
    const userId = req.user._id;

    let hashedPassword = undefined;
    if (visibility === 'password-protected' && password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const form = new Form({
      title,
      formType,
      isPublic: visibility === 'public',
      visibility,
      password: hashedPassword,
      allowedEmails,
      collectUserInfo,
      fields,
      theme,
      userId,
    });

    console.log('Form object created, saving...');
    await form.save();
    console.log('Form saved successfully');

    // Send emails if password protected and emails provided
    if (visibility === 'password-protected' && allowedEmails && allowedEmails.length > 0) {
      const formLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/form/${form._id}`;
      const subject = `You are invited to fill out: ${title}`;
      const htmlContent = `
        <h2>You have been invited!</h2>
        <p>Please fill out the form <strong>${title}</strong>.</p>
        <p><strong>Link:</strong> <a href="${formLink}">${formLink}</a></p>
        <p><strong>Password:</strong> ${password}</p>
        <br/>
        <p>Thank you!</p>
      `;

      // Send to all emails
      allowedEmails.forEach(email => {
        sendEmail(email, subject, htmlContent);
      });
    }

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
    const { title, formType, isPublic, fields, theme, visibility, password, allowedEmails, collectUserInfo } = req.body;

    let updateData = { title, formType, isPublic, fields, theme, visibility, allowedEmails, collectUserInfo };

    if (visibility === 'password-protected' && password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const form = await Form.findByIdAndUpdate(
      req.params.id,
      updateData,
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

exports.submitResponse = async (req, res) => {
  try {
    const { formId } = req.params;
    const { data, respondentInfo } = req.body;

    const submission = new Submission({
      formId,
      data,
      respondentInfo
    });

    await submission.save();
    return successJson(res, submission, 'Response submitted successfully', 201);
  } catch (error) {
    return errorJson(res, error.message, 400);
  }
};

exports.getFormSubmissions = async (req, res) => {
  try {
    const { formId } = req.params;
    // Verify user owns the form
    const form = await Form.findOne({ _id: formId, userId: req.user._id });
    if (!form) {
      return errorJson(res, 'Form not found or access denied', 404);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const submissions = await Submission.find({ formId })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);
    return successJson(res, submissions, 'Submissions fetched');
  } catch (error) {
    return errorJson(res, error.message, 500);
  }
};