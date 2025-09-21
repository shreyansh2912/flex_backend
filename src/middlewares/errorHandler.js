module.exports = (err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    is_error:true,
    data:[],
    message: err.message || 'Internal Server Error',
  });
};
