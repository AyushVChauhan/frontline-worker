const express = require("express");
const router = express.Router();
const coordinatorControllers = require("../controllers/coordinator");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const myCache = require("../controllers/cache");
const addModule = require("../controllers/coordinator/addModule");
const getModule = require("../controllers/coordinator/getModule");
const addSubject = require("../controllers/coordinator/addSubject");
const getSubject = require("../controllers/coordinator/getSubject");
const addTopic = require("../controllers/coordinator/addTopic");
const getTopic = require("../controllers/coordinator/getTopic");

const storage = multer.diskStorage({
  destination: "./public/files",
  filename: (req, file, cb) => {
    let name = file.originalname.split(".");
    cb(null, Date.now() + "." + name[name.length - 1]);
  },
});
const upload = multer({ storage: storage });
const questionStorage = multer.diskStorage({
  destination: "./public/files/questions",
  filename: (req, file, cb) => {
    let name = file.mimetype.split("/");
    cb(null, Date.now() +"."+name[1]);
  },
});
const questionUpload = multer({ storage: questionStorage });

// router.use(middleware);
// router.get("/getModule", getModule.getModule);

router.get("/getSubject", getSubject.getSubject);
router.post("/addSubject", addSubject.addSubject);
// router.post("/login", coordinatorControllers.login);
// router.get("/login", coordinatorControllers.loginGet);
// // router.get("/logout", teacherControllers.logout);

// done
router.get("/", coordinatorControllers.coordinatorDashboard);
router.get("/workers", coordinatorControllers.workers);
router.get("/subjects", coordinatorControllers.subjects);

//middleware type
router.get("/modules", (req, res) => {
  res.redirect("/coordinator/subjects");
});
//render
router.get("/modules/:id", coordinatorControllers.modules);
router.post("/addModule", addModule.addModule);
//ajax
router.post("/modulesOrder", coordinatorControllers.modulesOrder);
router.post("/moduleLeaderboard", coordinatorControllers.moduleLeaderboard);
router.post("/getFeedback",coordinatorControllers.getFeedback)
//render
router.get("/topics/:id", coordinatorControllers.topics);
router.get("/addTopic/:id", coordinatorControllers.addTopicRender);
router.post("/addTopic", upload.array("resources"), addTopic.addTopic);
router.get("/getTopic", getTopic.getTopic);

//ajax
router.post("/topicsOrder", coordinatorControllers.topicsOrder);
router.post("/topicDetail", coordinatorControllers.topicDetail);

// render
router.get("/questions", coordinatorControllers.question);
// ajax
router.post("/getQuestion", coordinatorControllers.getQuestion);
router.post("/questionDetail", coordinatorControllers.questionDetail);

router.get("/deleteQuestion/:id", coordinatorControllers.deleteQuestion);

// render
router.get("/addQuestion/topics", coordinatorControllers.addQue_subSelect);
// ajax
router.post("/getModules", coordinatorControllers.getModules);
router.post("/addQuestion/getTopics", coordinatorControllers.getTopics);
router.post("/addQuestion/setTopics", coordinatorControllers.setTopics);

// render
router.get(
  "/addQuestion/question",
  questionMiddleware,
  coordinatorControllers.addQue_question
);
// ajax
router.post(
  "/addQuestion/question",
  questionMiddleware,
  coordinatorControllers.addQuestion
);
router.post(
  "/addQuestion/question/files",
  questionMiddleware,
  questionUpload.array("questionFiles"),
  coordinatorControllers.addQuestionFiles
);

router.get("/myQuiz", coordinatorControllers.myQuizPage);
// ajax
router.post("/myQuiz/getMyQuiz", coordinatorControllers.getMyQuiz);

// render
router.get("/addQuiz/setQuiz", coordinatorControllers.createQuiz);
// ajax
router.post("/addQuiz/setQuiz", coordinatorControllers.setQuiz);

// render
router.get("/addQuiz/questions", coordinatorControllers.addQuizQuestion);
// ajax
router.post("/addQuiz/setQuestions", coordinatorControllers.setQuestions);

// render
router.get(
  "/addQuiz/setCompulsaryQuestions",
  coordinatorControllers.setCompulsaryQuestions
);
// ajax
router.post(
  "/addQuiz/setCompulsaryQuestions",
  coordinatorControllers.setCompulsaryQuestionsPost
);

//late
// router.post("/addTopic", coordinatorControllers.addTopic);

//render
router.get("/allQuiz", coordinatorControllers.allQuizPage);
//ajax
router.post("/myQuiz/getAllQuiz", coordinatorControllers.getAllQuiz);
router.get("/quiz/quizDetails/:quizId", coordinatorControllers.quizDetails);

router.get("/generateReport/:quizId", coordinatorControllers.generateReport);
router.get("/downloadReport/:quizId", coordinatorControllers.downloadReport);
router.get("/approve/:sessionId", coordinatorControllers.approve);
router.post("/approveCertificate/:sessionId",coordinatorControllers.approveCertificate);
router.post("/rejectCertificate/:sessionId",coordinatorControllers.rejectCertificate);

router.post("/getComments", coordinatorControllers.getComments);
router.post("/replyComment", coordinatorControllers.replyComment);
// router.post("/evaluate", teacherControllers.evaluatePost);
function questionMiddleware(req, res, next) {
  if (req.session.topics) {
    next();
  } else {
    res.redirect("/coordinator/addQuestion/topics");
  }
}

function middleware(req, res, next) {
  let cookie = req.cookies.auth;
  if (cookie) {
    let data = jwt.verify(cookie, process.env.JWT_SECRET);
    // console.log;
    if (data.role === 1) {
      //console.log("Next");
      next();
    } else {
      res.redirect("/coordinator/login");
    }
  } else {
    res.redirect("/coordinator/login");
  }
}

module.exports = router;
