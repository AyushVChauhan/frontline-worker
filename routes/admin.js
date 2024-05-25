const express = require("express");
const router = express.Router();
const adminControllers = require("../controllers/admin");
const authorityControllers = require("../controllers/authorityController");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const storage = multer.diskStorage({
    destination: "./public/files",
    filename: (req, file, cb) => {
        cb(null, "schema.xlsx");
    },
});
const upload = multer({ storage: storage, limits: { fileSize: 15000000 } });

router.use(middleware);
router.get("/", adminControllers.adminDashboard);

//authorities
router.get("/authorities", adminControllers.authorities);
router.post("/addAuthority", adminControllers.addAuthority);

//subjects
router.get("/subjects", adminControllers.subjects);
router.get("/subjects/delete/:id", adminControllers.deleteSubject);
router.post("/addSubject", adminControllers.addSubject);
//editSubject

//coordinators
router.get("/coordinators", adminControllers.coordinators); //all coordinators
router.post("/getCoordinator", adminControllers.getCoordinator); //filtered coordinators
router.post("/addCoordinator", adminControllers.addCoordinator);

//workers
router.get("/workers", adminControllers.workers); //all workers
router.post("/getWorker", adminControllers.getWorker); //filtered workers
// router.post("/getSubject", adminControllers.getSubject);

// router.get("/students/delete/:id", adminControllers.deleteStudent);

//quizzes
router.get("/quiz", adminControllers.quiz); //all subjects quiz
router.post("/getQuiz", adminControllers.getQuiz); //quiz filtered by subject or date
router.get("/quiz/quizDetails/:quizId", adminControllers.quizDetails);
router.get("/generateReport/:quizId", adminControllers.generateReport);
router.get("/downloadReport/:quizId", adminControllers.downloadReport);
router.get("/generalAnalysis", adminControllers.generalAnalysis);
router.post("/sendMail", authorityControllers.sendMailToWorker);

router.get("/myQuiz", adminControllers.myQuiz);

//leaderboard
router.get("/leaderboard", adminControllers.leaderboard);
//ajax
router.post("/getQuizzes", adminControllers.getQuizzes);

//subject analysis
router.get("/subjectAnalysis", adminControllers.subjectAnalysis);

//score analysis
router.get("/scoreAnalysis", adminControllers.scoreAnalysis);

//add quiz
router.get("/addQuiz/setQuiz", adminControllers.createQuiz);
router.post("/addQuiz/setQuiz", adminControllers.setQuiz);
router.get("/addQuiz/questions", adminControllers.addQuizQuestion);
router.post("/addQuiz/setQuestions", adminControllers.setQuestions);
router.get(
    "/addQuiz/setCompulsaryQuestions",
    adminControllers.setCompulsaryQuestions
);
// ajax
router.post(
    "/addQuiz/setCompulsaryQuestions",
    adminControllers.setCompulsaryQuestionsPost
);

//certificate
router.get("/certificates", adminControllers.certificatesController);

//Not Useful
// router.get("/departments/delete/:id", adminControllers.deleteDepartment);
// router.post("/addStudent", upload.single("excel"), adminControllers.addStudent);
// router.get("/groups", adminControllers.getGroups);
// router.post("/addGroup" , upload.single("excel") , adminControllers.addGroup);
// router.post("/viewGroup" , adminControllers.viewGroup);

//move middleware above get() afterwards
function middleware(req, res, next) {
    let cookie = req.cookies.auth;
    if (cookie) {
        let data = jwt.verify(cookie, process.env.JWT_SECRET);
        if (data.role === 3) {
            next();
        } else {
            res.redirect("/login");
        }
    }
}

module.exports = router;
