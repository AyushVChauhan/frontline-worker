const session = require("express-session");
const quizzes = require("../models/quizzes");
const sessions = require("../models/sessions");
const adminServices = require("../services/admin");
const workerServices=require("../services/worker");
const authorityServices = require("../services/authorityServices");
const coordinatorServices = require("../services/coordinator");
const xlsx = require("xlsx");
const mailer = require("./mailer");
const jwt = require("jsonwebtoken");
const administrations = require("../models/administrations");
async function dashboardPage(req, res) {
    let authority_count = await adminServices.countAuthority();
    let coordinator_count = await adminServices.countCoordinators();
    let subject_count = await adminServices.countSubjects();
    let worker_count = await adminServices.countWorkers();
    let final_tests = await quizzes.count({ type: 2 });
    let certificates = await sessions.count({ is_evaluated: 1 });
    res.render("./authority/authorityDashboard", {
        authority_count,
        coordinator_count,
        subject_count,
        worker_count,
        final_tests,
        certificates,
    });
}

async function subjectAnalysis(req, res) {
    res.render("./authority/subjectAnalysis");
}

async function scoreAnalysis(req, res) {
    res.render("./authority/scoreAnalysis");
}

async function scoreAnalysisPost(req, res) {
    let districtId = req.cookies.districtId;
    if(req.body.admin==1){
        districtId={$exists:true};
    }
    let type = req.body.type;
    let dateFrom = null;
    if (req.body.datefrom == "") {
        dateFrom = new Date(1970, 1, 1);
    } else {
        dateFrom = new Date(req.body.datefrom);
    }
    let dateTo = new Date(req.body.dateto);
    if (req.body.dateto == "") {
        dateTo = new Date(4000, 1, 1);
    } else {
        dateTo = new Date(req.body.dateto);
    }
    let myArr = await authorityServices.scoreAnalysis(
        type,
        dateFrom,
        dateTo,
        districtId
    );
    for (let index = 0; index < myArr.length; index++) {
        if (myArr[index][1].totalMarks == 0) {
            myArr[index][1].totalMarks = 1;
        }
    }
    res.json({ success: 1, myArr });
}
async function subjectAnalysisPost(req, res) {
    let districtId = req.cookies.districtId;
    if(req.body.admin==1){
        districtId={$exists:true};
    }
    let type = req.body.type;
    let dateFrom = null;
    if (req.body.datefrom == "") {
        dateFrom = new Date(1970, 1, 1);
    } else {
        dateFrom = new Date(req.body.datefrom);
    }
    let dateTo = new Date(req.body.dateto);
    if (req.body.dateto == "") {
        dateTo = new Date(4000, 1, 1);
    } else {
        dateTo = new Date(req.body.dateto);
    }
    let myArr = await authorityServices.subjectAnalysis(
        type,
        dateFrom,
        dateTo,
        districtId
    );
    res.json({ success: 1, myArr });
}

async function quiz(req, res) {
    let errors = null;
    if (req.session.errors) {
        errors = req.session.errors;
        req.session.errors = null;
    }
    let subData = await adminServices.fetchSubjects();
    res.render("./authority/quiz", { subData, errors });
}
async function certificatesController(req, res) {
    let districtId = req.cookies.districtId;

    let myCertificates = await authorityServices.getCertificates(districtId);
    res.render("./authority/certificates", { myCertificates });
}
async function getQuiz(req, res) {
    let districtId = req.cookies.districtId;
    let quizData = await authorityServices.getQuiz(req.body, districtId);
    let allAnalysis = await coordinatorServices.allAnalysis(quizData);

    res.json({ success: 1, quizData: quizData, allAnalysis });
}

async function quizDetails(req, res) {
    // console.log(req.params.quizId);
    let errors = null;
    if (req.session.errors) {
        errors = req.session.errors;
        req.session.errors = null;
    }
    let quiz = await adminServices.quizDetails(req.params.quizId);
    res.render("./authority/quizDetails", { quiz: quiz, errors: errors });
}
async function generateReport(req, res) {
    let districtId = req.cookies.districtId;
    let quizId = req.params.quizId;
    let [
        quiz,
        worker,
        statusChart,
        marksChart,
        moduleMarks,
        difficultyMarks,
        timeDifficulty,
        timeModules,
        total,
    ] = await coordinatorServices.generateReport(quizId, districtId);
    // console.log(marksChart);
    // res.json({quiz,worker});
    res.render("./authority/reportPage", {
        errors: null,
        quiz,
        worker,
        statusChart,
        marksChart,
        moduleMarks,
        difficultyMarks,
        timeDifficulty,
        timeModules,
        total,
    });
}

async function downloadReport(req, res) {
    let districtId = req.cookies.districtId;
    let quizId = req.params.quizId;
    let excelObject = await coordinatorServices.downloadReport(
        quizId,
        districtId
    );
    let newSheet = xlsx.utils.json_to_sheet(excelObject);
    let newBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(newBook, newSheet, "Report");
    let filename2 = `files/reports/${Date.now()}.xlsx`;
    let filename = `./public/` + filename2;
    await xlsx.writeFile(newBook, filename);
    res.redirect(`http://localhost:3000/${filename2}`);
}

async function leaderboard(req, res) {
    let subData = await adminServices.fetchSubjects();
    res.render("./authority/leaderboard", { subData });
}

async function leaderboardPost(req, res) {
    let districtId = req.cookies.districtId;
    if(req.body.admin==1){
        districtId={$exists:true};
    }
    let quiz = req.body.quiz;
    let dateFrom = null;
    if (req.body.datefrom == "") {
        dateFrom = new Date(1970, 1, 1);
    } else {
        dateFrom = new Date(req.body.datefrom);
    }
    let dateTo = new Date(req.body.dateto);
    if (req.body.dateto == "") {
        dateTo = new Date(4000, 1, 1);
    } else {
        dateTo = new Date(req.body.dateto);
    }
    let myArr = await authorityServices.leaderboard(
        dateFrom,
        dateTo,
        districtId,
        quiz
    );

    res.json({ success: 1, myArr });
}

async function getQuizzes(req, res) {
    let type = req.body.type;
    let subjectId = req.body.subject;
    let dateFrom = null;
    if (req.body.datefrom == "") {
        dateFrom = new Date(1970, 1, 1);
    } else {
        dateFrom = new Date(req.body.datefrom);
    }
    let dateTo = new Date(req.body.dateto);
    if (req.body.dateto == "") {
        dateTo = new Date(4000, 1, 1);
    } else {
        dateTo = new Date(req.body.dateto);
    }
    let quizData = await authorityServices.getQuizzes(
        dateFrom,
        dateTo,
        subjectId,
        type
    );
    res.json({ success: 1, quizData });
}

async function getPerformance(req, res) {
    let workerId = req.body.id;
    let subjectId = req.body.subjectId;
    let radialData = await workerServices.radialPerformance(workerId, subjectId);
    let [trainingData, practiceData] = await authorityServices.performance(
        workerId,
        subjectId
    );
    res.json({ trainingData, practiceData,radialData, success: 1 });
}

async function getWorkerDetails(req, res) {
    let workerId = req.body.id;
    // console.log(workerId);
    let worker = await authorityServices.getWorkerDetails(workerId);
    res.json({ worker, success: 1 });
}

async function sendMailToWorker(req, res) {
    let email = req.body.email;
    let message = req.body.message;
    let myId = jwt.verify(req.cookies.auth,process.env.JWT_SECRET)["id"];
    let myMail = await administrations.findOne({_id:myId},{email:1});
    let mailDetails = {
        from: myMail.email,
        to: email,
        subject: "FRONTLINE WORKER",
        html: message,
    };
    console.log(mailDetails);
    let msg = await mailer.sendMail(mailDetails);
    res.json({success:1})
}

module.exports = {
    dashboardPage,
    quiz,
    getQuiz,
    quizDetails,
    generateReport,
    downloadReport,
    subjectAnalysis,
    subjectAnalysisPost,
    scoreAnalysis,
    scoreAnalysisPost,
    leaderboard,
    leaderboardPost,
    getQuizzes,
    getPerformance,
    getWorkerDetails,
    certificatesController,
    sendMailToWorker
};
