const administrations = require("../models/administrations");

function randomPassword() {
	let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@$%^&*()_-=+,.";
	let pass = "";
	for (let i = 0; i < 8; i++) {
		pass += characters[Math.floor(Math.random() * characters.length)];
	}
	return pass;
}
async function loginFetch(username, password, role) {
	// console.log(role);
	let rol = parseInt(role);

	let data = await administrations.findOne({
		username: username,
		password: password,
		role: role,
	});
	// console.log(data);
	return data;
}
module.exports = { randomPassword, loginFetch };
