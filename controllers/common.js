const commonServices = require("../services/common");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const xlsx = require("xlsx");
const myCache = require("./cache");
const { default: mongoose } = require("mongoose");

async function login(req, res) {
	let data = await commonServices.loginFetch(req.body.username, req.body.password, req.body.role);
	if (data != null) {
		let token = jwt.sign(
			{
				username: req.body.username,
				password: req.body.password,
				id: data._id,
				role: data.role + 1,
			},
			process.env.JWT_SECRET
		);
		res.cookie("auth", token);
		res.cookie("name", data.username);
		if (data.role === 0) {
			res.redirect("/coordinator");
		} else if (data.role === 1) {
			res.cookie("districtId", data.districtId);
			res.redirect("/authority");
		} else if (data.role === 2) {
			res.redirect("/admin");
		}
	} else {
		res.redirect("/login");
	}
}

async function loginGet(req, res) {
	res.render("../views/login");
}
module.exports = { login, loginGet };
