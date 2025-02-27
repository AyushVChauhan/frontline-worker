const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.MAIL_USERNAME,
		pass: process.env.MAIL_PASSWORD,
	},
});
transporter.verify(function (error, success) {
	if (error) {
		console.log(error);
	} else {
		console.log("Server is ready to take our messages");
	}
});

module.exports = transporter;
