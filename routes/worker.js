const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const workerController = require("../controllers/worker/workerController");
const { randomBytes } = require("crypto");

// Configure multer disk storage for storing uploaded files
// Output: A storage configuration object for multer
const storage = multer.diskStorage({
	destination: "./public/files/workers",
	filename: (req, file, cb) => {
		cb(null, randomBytes(10).toString("hex") + "." + file.mimetype.split("/")[1]);
	},
});

// Configure multer for handling file uploads with specified storage and file size limit
// Output: A multer upload configuration object
const upload = multer({ storage: storage, limits: { fileSize: 15000000 } });

// Configure multer disk storage for storing uploaded photos
// Output: A storage configuration object for multer

router.post("/workerSignup", upload.single("photo"), workerController.workerSignup);
router.post("/workerPhoto", upload.single("photo"), workerController.workerPhoto);
router.post("/workerLogin", workerController.workerLogin);
router.get("/workerLogout", workerController.workerLogout);

router.get("/getdistrict", workerController.fetchDistrict);
router.get("/generateCertificatePdf", workerController.generateCertificatePdf);
router.get("/putDataInCertificate", workerController.putDataInCertificate);
// router.use(middleware);

router.get("/getSubjects", workerController.getSubjects);
router.get("/addMySubject", workerController.addMySubject);
router.get("/getModules", workerController.getModules);
router.get("/getTopics", workerController.getTopics);
router.get("/upcomingQuiz", workerController.upcomingQuiz);
router.get("/availableQuiz", workerController.availableQuiz);
router.get("/generalQuiz", workerController.generalQuiz);
router.get("/profile", workerController.profile);
router.get("/bookmarkTopic", workerController.bookmarkTopic);
router.get("/completeTopic", workerController.completeTopic);
router.get("/takeQuiz", workerController.takeQuiz);
router.get("/practiceQuizId", workerController.practiceQuizId);
router.get("/trainingQuizId", workerController.trainingQuizId);
router.get("/getSession", workerController.getSession);
router.post("/submitQuiz", workerController.submitQuiz);
router.get("/trainingCertificate", workerController.trainingCertificate);
router.get("/finalCertificate", workerController.finalCertificate);
router.get("/history", workerController.history);
router.get("/getQuizHistory", workerController.getQuizHistory);

router.get("/getBookmarks", workerController.getBookmarks);
router.get("/analysis", workerController.analysis);
router.get("/generalAnalysis", workerController.generalAnalysis);
router.get("/leaderboard", workerController.leaderboard);
router.get("/performance", workerController.performance);
router.post("/moduleRating", workerController.moduleRating);
router.post("/verifyPhoto", upload.single("photo"), workerController.verifyPhoto);
router.post("/disqualifyPhoto", upload.single("photo"), workerController.disqualifyPhoto);
router.get("/disqualifyBackground", workerController.disqualifyBackground);
router.get("/getComments", workerController.getComments);
router.post("/addComment", workerController.addComment);
router.post("/addReply", workerController.addReply);

// Middleware for user authentication and authorization
// Input:
//   - req: The Express request object
//   - res: The Express response object
//   - next: The next middleware function in the chain
// Output:
//   - If user is authenticated and active, it proceeds to the next middleware.
//   - If user is not authenticated or not active, it sends a JSON response indicating failure (success: 0).
function middleware(req, res, next) {
	let cookie = req.cookies.auth;
	if (req.query?.token) {
		cookie = req.query.token;
	}
	if (cookie) {
		try {
			var data = jwt.verify(cookie, process.env.JWT_SECRET);
		} catch (error) {
			res.json({ success: 0 });
			return;
		}
		if (data?.user?.is_active == 1) {
			next();
		} else {
			res.json({ success: 0 });
		}
	} else {
		res.json({ success: 0 });
	}
}

module.exports = router;
