require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const commonControllers = require("./controllers/common");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const reminders = require("./models/reminders");
const sendPushNotification = require("./controllers/pushNotification");
const session = require("express-session");
const adminRoutes = require("./routes/admin");
const coordinatorRoutes = require("./routes/coordinator");
const authorityRoutes = require("./routes/authority");
const workerroutes = require("./routes/worker");
const asyncRouteHandler = require("./utils/route-handler");
const errorHandler = require("./utils/error-handler");
const morgan = require("morgan");

["log", "warn", "error"].forEach((methodName) => {
	const originalMethod = console[methodName];
	console[methodName] = (...args) => {
		let initiator = "unknown place";
		try {
			throw new Error();
		} catch (e) {
			if (typeof e.stack === "string") {
				let isFirst = true;
				for (const line of e.stack.split("\n")) {
					const matches = line.match(/^\s+at\s+(.*)/);
					if (matches) {
						if (!isFirst) {
							// first line - current function
							// second line - caller (what we are looking for)
							initiator = matches[1];
							break;
						}
						isFirst = false;
					}
				}
			}
		}
		originalMethod.apply(console, [...args, "\n", `  at ${initiator}`]);
	};
});

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
	session({
		secret: process.env.JWT_SECRET,
		resave: false,
		saveUninitialized: false,
	})
);

app.get("/", (req, res) => {
	let cookie = req.cookies.auth;
	if (cookie) {
		let data = jwt.verify(cookie, process.env.JWT_SECRET);

		if (data.role === 1) {
			res.redirect("/coordinator");
		} else if (data.role === 3) {
			res.redirect("/admin");
		} else if (data.role === 2) {
			res.redirect("/authority");
		}
	} else {
		res.redirect("/login");
	}
});
app.get("/login", asyncRouteHandler(commonControllers.loginGet));
app.post("/login", asyncRouteHandler(commonControllers.login));

app.use("/authority", authorityRoutes);
app.use("/coordinator", coordinatorRoutes);
app.use("/worker", workerroutes);

app.use("/admin", adminRoutes);

app.get("/logout", (req, res) => {
	res.clearCookie("auth");
	res.redirect("/");
});

app.get("*", (req, res) => {
	res.render("./partials/errorPage");
});

app.use(errorHandler);

mongoose
	.connect(process.env.MONGO_URI)
	.then(() => {
		app.listen(process.env.PORT, () => {
			console.log("http://localhost:3000");
		});
	})
	.catch((err) => {
		console.log(err);
	});

cron.schedule("*/1 * * * *", async function () {
	console.log("run");
	let today = new Date();
	let reminder = await reminders
		.find({ issent: 0, date: { $lt: today } })
		.populate({ path: "workerIds", select: { pushToken: 1 } });
	for (let index = 0; index < reminder.length; index++) {
		const element = reminder[index];
		let tokens = element.workerIds.map((ele) => ele.pushToken);
		tokens = tokens.filter((ele) => ele != null);
		await sendPushNotification(tokens, element.title, element.message);
		element.issent = 1;
		element.save();
	}
});
