const FormData = require('../models/form.model');
const { successJson, errorJson } = require('../utils/responseHelpers');

exports.createFormData = async (req, res) => {
    try {
        const { formId, data } = req.body;
        const formData = new FormData({
            formId,
            data,
        });
        await formData.save();
        return successJson(res, formData, 'Form data created', 201);
    } catch (error) {
        return errorJson(res, error.message, 400);
    }
};
