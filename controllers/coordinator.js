const coordinatorServices = require("../services/coordinator");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const xlsx = require("xlsx");
const myCache = require("./cache");
const { default: mongoose } = require("mongoose");
const questions = require("../models/questions");
const quizzes = require("../models/quizzes");
const workersModel = require("../models/workers");
const subjectModel = require("../models/subjects");
const fs = require("fs");
const puppeteer = require("puppeteer");
async function uploadStudent(req, res) {
    var mySheet = xlsx.readFile("./public/images/schema.xlsx");
    var sheets = mySheet.SheetNames;
    var obj = xlsx.utils.sheet_to_json(mySheet.Sheets[sheets[0]]);
    if (obj[0]["Enrollment No"] === undefined) {
        res.json({ error: "error" });
    } else {
        let excelData = [];
        obj.forEach(async (element) => {
            await adminServices.addStudent(element["Enrollment No"]);
        });
    }
}

async function coordinatorDashboard(req, res) {
    let errors = null;
    if (req.session.errors) {
        errors = req.session.errors;
        req.session.errors = null;
    }
    let myId = jwt.verify(req.cookies.auth, process.env.JWT_SECRET)["id"];

    let allQuiz = await quizzes.count({ type: 2 });
    let myQuiz = await quizzes.count({
        type: 2,
        created_by: new mongoose.Types.ObjectId(myId),
    });
    let questionCount = await questions.count({ created_by: myId });
    let worker = await workersModel.count({});
    let subject = await subjectModel.count({});
    // console.log(allQuiz, myQuiz, questionCount, worker, worker);

    res.render("./coordinator/coordinator_dashboard", {
        errors,
        allQuiz,
        myQuiz,
        questionCount,
        worker,
        subject,
    });
}

async function addTopic(req, res) {
    await coordinatorServices.addTopic(req.body);
    res.redirect("/coordinator/addQuestion/topics");
}

async function getTopics(req, res) {
    let data = await coordinatorServices.getTopics(req.body);
    res.json(data);
}

async function setTopics(req, res) {
    req.session.topics = req.body.selectedTopics;
    res.json({ success: 1 });
}

async function addQue_question(req, res) {
    res.render("./coordinator/addQuestion2");
}

async function addQuestion(req, res) {
    let topics = req.session.topics;
    let topicId = [];
    let options = [];
    let cookie = req.cookies.auth;
    let data = jwt.verify(cookie, process.env.JWT_SECRET);
    topics.forEach((ele) => {
        topicId.push(new mongoose.Types.ObjectId(ele["_id"]));
    });
    let type = req.body.type;
    if (type == 1) {
        req.body.options.forEach((ele) => {
            options.push({ option: ele, file: null });
        });
    }
    let question = {
        topicId,
        question: req.body.question,
        marks: req.body.marks,
        type: req.body.type,
        difficulty: req.body.difficulty,
        options: options,
        answer:
            type == 1 ? req.body.options[req.body.answer - 1] : req.body.answer,
        is_active: 1,
        created_by: data.id,
        time_required: req.body.time_required,
        caseSensitive: req.body.caseSensitive,
    };
    let questionId = await coordinatorServices.addQuestion(question);
    console.log(questionId);
    res.json({ success: 1, questionId: questionId });
}

async function addQuestionFiles(req, res) {
    for (let index = 0; index < req.files.length; index++) {
        const element = req.files[index];
        let filePath = "/files/questions/" + element.filename;
        let description = element.originalname;
        await coordinatorServices.addQuestionFile(
            req.body.questionId,
            filePath,
            description
        );
    }
    res.json({ success: 1 });
}

async function createQuiz(req, res) {
    let myId = jwt.verify(req.cookies.auth, process.env.JWT_SECRET)["id"];
    let subData = await coordinatorServices.subjectFetch(myId);
    res.render("./coordinator/addQuiz1", { subData });
}
async function setQuiz(req, res) {
    req.session.quiz = req.body;
    let cookie = req.cookies.auth;
    let id = jwt.verify(cookie, process.env.JWT_SECRET);
    let data = req.body;
    data.subjectId = new mongoose.Types.ObjectId(data.subject_id);
    data.created_by = id.id;
    data.type = 2;
    // console.log(data);
    let setQuiz = await coordinatorServices.setQuiz(data);
    req.session.quizId = setQuiz;
    res.json({ success: 1 });
}
async function question(req, res) {
    let myId = jwt.verify(req.cookies.auth, process.env.JWT_SECRET)["id"];
    let subData = await coordinatorServices.subjectFetch(myId);
    res.render("./coordinator/questions", { subData });
}
async function getQuestion(req, res) {
    let myId = jwt.verify(req.cookies.auth, process.env.JWT_SECRET)["id"];
    let questionData = await coordinatorServices.getQuestion(req.body, myId);

    res.json({ success: 1, questionData });
}

async function questionDetail(req, res) {
    let questionDetail = await coordinatorServices.questionDetail(req.body.id);
    res.json({ success: 1, questionDetail });
}

async function addQuizQuestion(req, res) {
    let topics = [];
    // ayush 64e852425e5e7f3c61111360
    let subject = req.session.quiz.subject_id;
    let [moduleData, myArr] = await coordinatorServices.getModules({
        subjectId: subject,
    });
    // console.log(moduleData);
    let modules = moduleData.length;
    for (let index = 0; index < modules; index++) {
        let temp = await coordinatorServices.getTopics({
            module: moduleData[index]._id,
        });
        topics.push(...temp);
    }
    // console.log(t);
    // console.log(topics);
    let marks_questions = req.session.quiz.marks_questions;
    let moduleDataString = Buffer.from(JSON.stringify(moduleData)).toString(
        "base64"
    );
    let topicsString = Buffer.from(JSON.stringify(topics)).toString("base64");
    res.render("./coordinator/addQuiz3", {
        subject,
        modules,
        moduleData,
        topics,
        marks_questions,
        topicsString,
        moduleDataString,
    });
}

async function setQuestions(req, res) {
    let myArr = [];
    let marks_question = req.session.quiz.marks_questions;
    let selectedQuestions = req.body.selectedQuestions;
    // console.log(selectedQuestions);
    let flag = 0;
    marks_question.forEach((element) => {
        flag = 0;
        selectedQuestions.forEach((ele) => {
            if (ele.marks == element.marks) {
                flag++;
            }
        });
        if (flag > element.count) {
            myArr.push(element);
        }
    });
    if (myArr.length == 0) {
        let myIds = [];
        selectedQuestions.forEach((ele) => {
            myIds.push({
                question: new mongoose.Types.ObjectId(ele._id),
                marks: ele.marks,
            });
        });
        await coordinatorServices.setQuestions(myIds, req.session.quizId);
        req.session.errors = {
            text: "Quiz created Successfully",
            icon: "success",
        };

        res.json({ next_page: 0 });
    } else {
        let mySelectedQuestions = [];
        for (let index = 0; index < selectedQuestions.length; index++) {
            const element = selectedQuestions[index];

            let questionData = await questions
                .findOne({
                    _id: element._id,
                })
                .populate({
                    path: "topicId",
                    model: "topics",
                    select: { content: 0 },
                    populate: {
                        path: "moduleId",
                        model: "modules",
                        populate: {
                            path: "subjectId",
                            model: "subjects",
                        },
                    },
                })
                .populate({
                    path: "created_by",
                    model: "administrations",
                    select: "username",
                });
            mySelectedQuestions.push(questionData);
        }
        req.session.marks_questions = myArr;
        req.session.allQuestions = mySelectedQuestions;
        res.json({ next_page: 1 });
    }
}

function setCompulsaryQuestions(req, res) {
    let marks_questions = req.session.marks_questions;
    let allQuestions = req.session.allQuestions;
    let allQuestionsString = Buffer.from(JSON.stringify(allQuestions)).toString(
        "base64"
    );
    res.render("./coordinator/addQuiz4", {
        marks_questions,
        allQuestions,
        allQuestionsString,
    });
}
async function setCompulsaryQuestionsPost(req, res) {
    let selectedQuestions = req.body.selectedQuestions;
    // console.log(selectedQuestions);
    let compulsaryQuestions = [];
    let randomQuestions = [];
    selectedQuestions.forEach((element) => {
        if (element.random == 0) {
            compulsaryQuestions.push({
                question: new mongoose.Types.ObjectId(element._id),
                marks: element.marks,
            });
        } else {
            randomQuestions.push({
                question: new mongoose.Types.ObjectId(element._id),
                marks: element.marks,
            });
        }
    });
    await coordinatorServices.setCompulsaryQuestionsPost(
        req.session.quizId,
        compulsaryQuestions,
        randomQuestions
    );
    req.session.errors = { text: "Quiz created Successfully", icon: "success" };
    res.json({ success: 1 });
}
async function myQuizPage(req, res) {
    let errors = null;
    if (req.session.errors) {
        errors = req.session.errors;
        req.session.errors = null;
    }
    let myId = jwt.verify(req.cookies.auth, process.env.JWT_SECRET)["id"];
    let subData = await coordinatorServices.subjectFetch(myId);

    res.render("./coordinator/myQuiz", { errors, subData });
}
async function allQuizPage(req, res) {
    let errors = null;
    if (req.session.errors) {
        errors = req.session.errors;
        req.session.errors = null;
    }
    let myId = jwt.verify(req.cookies.auth, process.env.JWT_SECRET)["id"];
    let subData = await coordinatorServices.allSubjectFetch();

    res.render("./coordinator/allQuiz", { errors, subData });
}
async function getMyQuiz(req, res) {
    let cookie = req.cookies.auth;
    let data = jwt.verify(cookie, process.env.JWT_SECRET);
    let quizData = await coordinatorServices.getMyQuiz(req.body, data.id);
    let allAnalysis = await coordinatorServices.allAnalysis(quizData);
    res.json({ success: 1, quizData, allAnalysis });
}
async function getAllQuiz(req, res) {
    let quizData = await coordinatorServices.getAllQuiz(req.body);
    res.json({ success: 1, quizData: quizData });
}
async function quizDetails(req, res) {
    // console.log(req.params.quizId);
    let errors = null;
    if (req.session.errors) {
        errors = req.session.errors;
        req.session.errors = null;
    }
    let quiz = await coordinatorServices.quizDetails(req.params.quizId);
    res.render("./coordinator/quizDetails", { quiz: quiz, errors: errors });
}
async function workers(req, res) {
    let errors = null;
    if (req.session.errors) {
        errors = req.session.errors;
        req.session.errors = null;
    }
    let myId = jwt.verify(req.cookies.auth, process.env.JWT_SECRET)["id"];
    let worker_data = await coordinatorServices.fetchWorkers(myId);
    res.render("./coordinator/workers", { worker_data, errors });
}
async function subjects(req, res) {
    let myId = jwt.verify(req.cookies.auth, process.env.JWT_SECRET)["id"];
    let sub_data = await coordinatorServices.subjectFetch(myId);
    res.render("./coordinator/subjects", { sub_data });
}
async function addQue_subSelect(req, res) {
    let myId = jwt.verify(req.cookies.auth, process.env.JWT_SECRET)["id"];

    let subData = await coordinatorServices.subjectFetch(myId);
    res.render("./coordinator/addQuestion1", { subData });
}
// async function generateReport(req, res) {
//     let quizId = req.params.quizId;
//     let report = await coordinatorServices.generateReport(quizId);
//     // let toSheet = [{enrollment,co1,co2,co3,totalmarks}]
//     let toSheet = [[" "]];
//     let AllCOS = Array.from(report[0][0][1].cos);
//     AllCOS.forEach((ele) => {
//         toSheet[0].push("CO-" + ele[0]);
//         toSheet[0].push(" ");
//     });
//     toSheet[0].push(" ");
//     toSheet.push(["Enrollment Number"]);
//     for (let index = 0; index < AllCOS.length; index++) {
//         toSheet[1].push("Total Marks");
//         toSheet[1].push("Obtained Marks");
//     }
//     toSheet[1].push("Total Marks/" + report[1]);
//     toSheet[1].push("Remaks");
//     report[0].forEach((element) => {
//         let myObject = [];
//         let enrollment = element[0];
//         let totalMarks = element[1].totalMarks;
//         let remark = element[1].remark;
//         let allCos = Array.from(element[1].cos);
//         // console.log(allCos);
//         myObject.push(enrollment);
//         allCos.forEach((ele) => {
//             myObject.push(ele[1].totalMarks);
//             myObject.push(ele[1].marks);
//             // myObject["CO-"+ele[0]] = ele[1].marks;
//         });

//         myObject.push(totalMarks);
//         myObject.push(remark);
//         // myObject["Total Marks/" + report[1]] = totalMarks;
//         toSheet.push(myObject);
//     });
//     console.log(toSheet);
//     let newSheet = xlsx.utils.aoa_to_sheet(toSheet);
//     let newBook = xlsx.utils.book_new();
//     let fileName = report[2];
//     xlsx.utils.book_append_sheet(newBook, newSheet, "Report");
//     await xlsx.writeFile(newBook, `./public/files/reports/${fileName}.xlsx`);
//     let errors = null;
//     if (req.session.errors) {
//         errors = req.session.errors;
//         req.session.errors = null;
//     }
//     let chart = await teacherServices.chartDetails(quizId);
//     console.log(chart);
//     let studentDetails = report[0];
//     res.render("./teacher/reportPage", {
//         errors,
//         chart,
//         fileName,
//         studentDetails,
//         totalMarks: report[1],
//     });
//     // res.download(`./public/files/reports/${fileName}.xlsx`)
// }

async function evaluate(req, res) {
    let errors = null;
    if (req.session.errors) {
        errors = req.session.errors;
        req.session.errors = null;
    }
    let sessionId = req.params.sessionId;
    let token = req.cookies.auth;
    let teacherId = jwt.verify(token, process.env.JWT_SECRET)["id"];
    let details = await teacherServices.evaluate(sessionId, teacherId);
    if (details) {
        res.render("./teacher/evaluate", {
            errors,
            details: details[0],
            quizId: details[1],
        });
    } else {
        res.redirect("/myQuiz");
    }
}

// async function evaluatePost(req, res){
//     let details = req.body.data;
//     let sessionId = req.body.sessionId;
//     let token = req.cookies.auth;
//     let teacherId = jwt.verify(token, process.env.JWT_SECRET)["id"];
//     let evaluateFlag = await teacherServices.evaluatePost(details, sessionId, teacherId);
//     if(evaluateFlag)
//     {
//         res.json({success:1})
//     }
//     else
//     {
//         res.json({error:1})
//     }
// }

async function getModules(req, res) {
    let myId = jwt.verify(req.cookies.auth, process.env.JWT_SECRET)["id"];
    let [modules, myArr] = await coordinatorServices.getModules(req.body);
    if (modules) {
        res.json({ success: 1, modules });
    } else {
        res.json({ success: 0, modules });
    }
}

async function modules(req, res) {
    if (req.params.id.length == 24) {
        var subId = new mongoose.Types.ObjectId(req.params.id);
        var [modules, myArr] = await coordinatorServices.getModules({
            subjectId: subId,
        });
        var modulesAnalysis = await coordinatorServices.moduleTestAnalysis(
            modules
        );
        // console.log(modulesAnalysis);
    }
    if (modules) {
        res.render("./coordinator/modules", {
            errors: null,
            modules,
            subjectId: req.params.id,
            modulesAnalysis,
            myArr,
        });
    } else {
        res.redirect("/coordinator/subjects");
    }
}
async function moduleLeaderboard(req, res) {
    let moduleId = req.body.moduleId;
    let leaderboard = await coordinatorServices.moduleLeaderboard(moduleId);
    res.json({ success: 1, leaderboard });
}
async function getFeedback(req, res) {
    let moduleId = req.body.moduleId;
    let feedbacks = await coordinatorServices.getFeedback(moduleId);
    res.json({ success: 1, feedbacks });
}

async function topics(req, res) {
    if (req.params.id.length == 24) {
        var moduleId = new mongoose.Types.ObjectId(req.params.id);
        var topics = await coordinatorServices.getTopics({ module: moduleId });
        var topicAnalysis = await coordinatorServices.topicAnalysis(topics);
    }
    if (topics) {
        res.render("./coordinator/topics", {
            errors: null,
            topics,
            moduleId: req.params.id,
            topicAnalysis,
        });
    } else {
        res.redirect("/coordinator/subjects");
    }
}

async function addTopicRender(req, res) {
    if (req.params.id.length == 24) {
        var moduleId = new mongoose.Types.ObjectId(req.params.id);
        var module = await coordinatorServices.getModuleFromModuleId(moduleId);
    }
    // console.log(module);
    if (module) {
        res.render("./coordinator/addTopic1", { errors: null, module });
    } else {
        res.redirect("/coordinator/subjects");
    }
}

async function topicDetail(req, res) {
    let topicDetail = await coordinatorServices.topicDetail(req.body.id);
    res.json({ success: 1, topicDetail });
}

async function modulesOrder(req, res) {
    let modules = req.body.modules;
    await coordinatorServices.modulesOrder(modules);
    res.json({ success: 1 });
}

async function topicsOrder(req, res) {
    let topics = req.body.topics;
    await coordinatorServices.topicsOrder(topics);
    res.json({ success: 1 });
}

async function generateReport(req, res) {
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
    ] = await coordinatorServices.generateReport(quizId);
    // console.log(moduleMarks);
    // res.json({quiz,worker});
    res.render("./coordinator/reportPage", {
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
    // res.json({
    //     errors: null,
    //     quiz,
    //     worker,
    //     statusChart,
    //     marksChart,
    //     moduleMarks,
    //     difficultyMarks,
    //     timeDifficulty,
    //     timeModules,
    // });
}

async function approve(req, res) {
    let sessionId = req.params.sessionId;
    let details = await coordinatorServices.approve(sessionId);
    res.render("./coordinator/approve", { details });
}

async function approveCertificate(req, res) {
    let sessionId = req.params.sessionId;
    let myMessage =
        "<h1>You have been provided with certificate</h1><h3>Check Out your certificate in application</h3>";
    if (req.body.message) {
        myMessage = req.body.message;
    }
    let myUser = jwt.verify(req.cookies.auth, process.env.JWT_SECRET)["username"];
    let [quizId, certificate, workerName, subjectName] =
        await coordinatorServices.approveCertificate(sessionId, myMessage);
    generateCertificatePdf(certificate, workerName, subjectName, myUser);
    res.json({ url: `/coordinator/generateReport/${quizId}` });
}
async function generateCertificatePdf(certificate, workerName, subjectName, coordinator) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    let website_url = null;
    let date = new Date(certificate.createdAt).getTime();

    // Determine the URL for the certificate template based on the certificate type
    if (certificate.type == 0) {
        website_url = `http://localhost:3000/worker/putDataInCertificate?name=${workerName}&subject=${subjectName}&date=${date}&type=0&certificateId=${certificate._id}`;
    } else {
        website_url = `http://localhost:3000/worker/putDataInCertificate?name=${workerName}&subject=${subjectName}&date=${date}&type=1&certificateId=${certificate._id}&coordinator=${coordinator}`;
    }

    // Navigate to the certificate template page
    await page.goto(website_url, { waitUntil: "networkidle0" });
    await page.emulateMediaType("screen");

    // Generate the PDF from the certificate template
    const pdf = await page.pdf({
        // path: `../../public/files/workers/certificates/${certificateId}.pdf`,
        printBackground: true,
        format: "A4",
        landscape: true,
        path: `./public/files/workers/certificates/${certificate._id.toString()}.pdf`,
        preferCSSPageSize: true,
        pageRanges: "1",
    });

    // Close the browser
    await browser.close();
}
async function rejectCertificate(req, res) {
    let sessionId = req.params.sessionId;
    let myMessage =
        "<h1>Your Certificate has been rejected</h1><h3>Better luck next time</h3>";
    if (req.body.message) {
        myMessage = req.body.message;
    }
    let quizId = await coordinatorServices.rejectCertificate(
        sessionId,
        myMessage
    );
    res.json({ url: `/coordinator/generateReport/${quizId}` });
}

async function deleteQuestion(req, res) {
    let questionId = req.params.id;
    let question = await coordinatorServices.deleteQuestion(questionId);
    res.redirect("/coordinator/questions");
}

async function downloadReport(req, res) {
    let quizId = req.params.quizId;
    let excelObject = await coordinatorServices.downloadReport(quizId);
    let newSheet = xlsx.utils.json_to_sheet(excelObject);
    let newBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(newBook, newSheet, "Report");
    let filename2 = `files/reports/${Date.now()}.xlsx`;
    let filename = `./public/` + filename2;
    await xlsx.writeFile(newBook, filename);
    res.redirect(`http://localhost:3000/${filename2}`);
}

async function getComments(req, res) {
    let { topicId } = req.body;
    let comments = await coordinatorServices.getComments(topicId);
    res.json({ success: 1, comments });
}

async function replyComment(req, res) {
    let myId = jwt.verify(req.cookies.auth, process.env.JWT_SECRET)["id"];
    let { commentId, message } = req.body;
    await coordinatorServices.replyComment(myId, commentId, message);
    res.json({ success: 1 });
}

module.exports = {
    getModules,
    modules,
    topics,
    addTopicRender,
    modulesOrder,
    coordinatorDashboard,
    addQue_subSelect,
    addTopic,
    getTopics,
    setTopics,
    topicsOrder,
    addQue_question,
    addQuestion,
    createQuiz,
    setQuiz,
    addQuestionFiles,
    question,
    getQuestion,
    questionDetail,
    addQuizQuestion,
    setQuestions,
    setCompulsaryQuestions,
    setCompulsaryQuestionsPost,
    myQuizPage,
    getMyQuiz,
    allQuizPage,
    getAllQuiz,
    quizDetails,
    workers,
    subjects,
    generateReport,
    evaluate,
    topicDetail,
    approve,
    approveCertificate,
    rejectCertificate,
    deleteQuestion,
    moduleLeaderboard,
    getFeedback,
    downloadReport,
    getComments,
    replyComment,
};
