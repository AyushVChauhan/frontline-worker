const express = require("express");
const router = express.Router();
const authorityController = require("../controllers/authorityController");

router.get("/", authorityController.dashboardPage)
router.get("/subjectAnalysis", authorityController.subjectAnalysis)
router.post("/subjectAnalysis", authorityController.subjectAnalysisPost);

router.get("/scoreAnalysis", authorityController.scoreAnalysis);
router.post("/scoreAnalysis", authorityController.scoreAnalysisPost);

router.get("/leaderboard", authorityController.leaderboard);
//ajax
router.post("/getQuizzes", authorityController.getQuizzes);
router.post("/leaderboard", authorityController.leaderboardPost);
router.post("/workerDetails", authorityController.getWorkerDetails);
router.post("/getPerformance", authorityController.getPerformance);
router.post("/sendMail",authorityController.sendMailToWorker)

router.get("/quizzes", authorityController.quiz);
router.post("/getQuiz", authorityController.getQuiz);
router.get("/quiz/quizDetails/:quizId",authorityController.quizDetails);
router.get("/generateReport/:quizId", authorityController.generateReport);
router.get("/downloadReport/:quizId", authorityController.downloadReport);

router.get("/certificates", authorityController.certificatesController);


module.exports = router;
