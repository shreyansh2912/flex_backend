const successJson = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    is_error: false,
    message,
    data,
  });
};

const errorJson = (res, error = 'Something went wrong', statusCode = 500) => {
  return res.status(statusCode).json({
    is_error: true,
    message: error,
  });
};

module.exports = {
  successJson,
  errorJson,
};
