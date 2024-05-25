async function errorHandler(error, req, res, next) {
	res.json({
		success: false,
		message: error.message,
		statusCode: error.statusCode || 500,
		statusMessage: error.status,
	});
}
module.exports = errorHandler;
