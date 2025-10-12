const { errorJson } = require("../utils/responseHelpers");

const validateRequest = (schema, property = "body") => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], { abortEarly: false });
        if (error) {
            const errors = error.details.reduce((acc, { path, message }) => {
                const cleanMessage = message.replace(/["]/g, '');
                acc[path[0]] = cleanMessage;
                return acc;
            }, {});

            return errorJson(res, errors, 400);
        }
        next();
    };
};

module.exports = validateRequest;
