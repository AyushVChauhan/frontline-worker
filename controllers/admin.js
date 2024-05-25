const adminServices = require("../services/admin");
const myCache = require("./cache");
const commonServices = require("../services/common");
const xlsx = require("xlsx");
const mailer = require("./mailer");
const sessions = require("../models/sessions");
const certificates = require("../models/certificates");
const coordinatorServices = require("../services/coordinator");
const quizzes = require("../models/quizzes");
const jwt = require('jsonwebtoken');
const questions = require("../models/questions");
//badha counts send thase (admin_dashboard.ejs)
async function adminDashboard(req, res) {
    let errors = null;

    if (req.session.errors) {
        errors = req.session.errors;
        req.session.errors = null;
    }
    let authority_count = await adminServices.countAuthority();
    let coordinator_count = await adminServices.countCoordinators();
    let subject_count = await adminServices.countSubjects();
    let worker_count = await adminServices.countWorkers();
    //sessions table ma jaine find karse jetla workers evaluated hase emno count return thase
    let certificates = await sessions.count({ is_evaluated: 1 });

    //admin_dashboard.ejs ma data pass karyo
    res.render("./admin/admin_dashboard", {
        errors,
        authority_count,
        coordinator_count,
        subject_count,
        worker_count,
        certificates,
    });
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
    let quizData = await adminServices.getQuizzes(
        dateFrom,
        dateTo,
        subjectId,
        type
    );
    res.json({ success: 1, quizData });
}

async function subjectAnalysis(req, res) {
    res.render("./admin/subjectAnalysis");
}
async function scoreAnalysis(req, res) {
    res.render("./admin/scoreAnalysis");
}


async function subjectAnalysisPost(req, res) {
    let districtId = req.cookies.districtId;
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


async function leaderboard(req, res) {
    let subData = await adminServices.fetchSubjects();
    res.render("./admin/leaderboard", { subData });
}

//jyare add authority par click karse authorities.ejs na page par to function call thase
//check karse if data ayelo empty na hoi to addAuthority function ma jase and add thaya pachi authorities.ejs ma redirect thase
//input:object containing all information
async function addAuthority(req, res) {
    if (req.body.name.trim() !== "") {
        let addAuthority = await adminServices.addAuthority(req.body);
        req.session.errors = {
            text: "Authority Added Successfully",
            icon: "success",
        };
    }
    res.redirect("/admin/authorities");
}
async function deleteDepartment(req, res) {
    await adminServices.deleteDepartment(req.params.id);
    req.session.errors = {
        text: "Department Deleted Successfully",
        icon: "success",
    };
    res.redirect("/admin/departments");
}

//particular subject ni id params mathi laine pass karse deleteSubject na function ma
async function deleteSubject(req, res) {
    await adminServices.deleteSubject(req.params.id);
    req.session.errors = {
        text: "Subject Deleted Successfully",
        icon: "success",
    };
    res.redirect("/admin/subjects");
}
async function deleteStudent(req, res) {
    await adminServices.deleteStudent(req.params.id);
    req.session.errors = {
        text: "Student Deleted Successfully",
        icon: "success",
    };
    res.redirect("/admin/students");
}


//jyare addSubject par click karse subjects.ejs ma to aa function call thase
//subject no data avse req.body ma ane ae pass thase addSubject function ma and add thai gaya pachi pachu subjects.ejs ma redirect thase
//agar 0 return thayu to ae subject add thayu ane 1 thayu eno matlab already subject chej
async function addSubject(req, res) {
    let errors = null;
    //to validate
    let sub = await adminServices.addSubject(req.body);
    if (sub === 0) {
        req.session.errors = {
            text: "Subject Added Successfully",
            icon: "success",
        };
    } else {
        req.session.errors = {
            text: "Subject Already Exists!",
            icon: "warning",
        };
    }
    res.redirect("/admin/subjects");
}
//retrieve all districts with corresponding authorities
async function authorities(req, res) {
    let errors = null;
    if (req.session.errors) {
        errors = req.session.errors;
        req.session.errors = null;
    }
    let authorityData = await adminServices.fetchDistricts();
    console.log(authorityData);
    //authorities.ejs ma authorityData send thase
    res.render("./admin/authorities", { authorityData, errors });
}
async function addStudent(req, res) {
    var mySheet = xlsx.readFile("./public/files/schema.xlsx");
    var sheets = mySheet.SheetNames;
    var obj = xlsx.utils.sheet_to_json(mySheet.Sheets[sheets[0]]);
    if (obj[0]["Enrollment No"] === undefined) {
        req.session.errors = {
            text: "No (Enrollment No) field",
            icon: "warning",
        };
    } else if (obj[0]["Email"] === undefined) {
        req.session.errors = { text: "No (Email) field", icon: "warning" };
    } else {
        let records = 0;
        for (let index = 0; index < obj.length; index++) {
            const element = obj[index];
            let password = commonServices.randomPassword();
            records += await adminServices.addStudent(
                element["Enrollment No"],
                element["Email"],
                password,
                req.body.semester,
                req.body.department
            );
        }
        req.session.errors = {
            text: `${records} records added`,
            icon: "success",
        };
    }
    res.redirect("/admin");
}

//dashboard ma subjects par click karse to aa function call thase and subjects no data pass karse subjects.ejs ma
async function subjects(req, res) {
    let errors = null;
    if (req.session.errors) {
        errors = req.session.errors;
        req.session.errors = null;
    }
    let sub_data = await adminServices.fetchSubjects();
    res.render("./admin/subjects", { sub_data, errors });
}

//badha districts na worker find karine return karse workers.ejs ma
async function workers(req, res) {
    let sub_data = await adminServices.fetchSubjects();
    let district_data = await adminServices.fetchDistricts();
    let student_data = await adminServices.fetchWorkers();
    res.render("./admin/workers", {
        sub_data,
        district_data,
        student_data,
        errors: null,
    });
}
async function addCoordinator(req, res) {
    let errors = null;
    //to validate
    let coordinator = await adminServices.addCoordinator(req.body);
    if (coordinator === 0) {
        req.session.errors = {
            text: "Coordinator Added Successfully",
            icon: "success",
        };
    } else {
        req.session.errors = {
            text: "Coordinator Already Exists!",
            icon: "warning",
        };
    }
    res.redirect("/admin/coordinators");
}

//Coordinators.ejs ma badha subjects and subjects na coordinators show thase aa function thi
async function coordinators(req, res) {
    let errors = null;
    if (req.session.errors) {
        errors = req.session.errors;
        req.session.errors = null;
    }
    let sub_data = await adminServices.fetchSubjects();
    let teacher_data = await adminServices.fetchCoordinators();
    res.render("./admin/coordinators", {
        sub_data,
        teacher_data,
        errors,
    });
}
async function getSubject(req, res) {
    let subData = await adminServices.getSubject(req.body);
    console.log(subData);
    res.json({ success: 1, subData });
}

//district filter lagadine aa function workers district wise return karse
async function getWorker(req, res) {
    let workerData = await adminServices.getWorker(req.body);
    res.json({ success: 1, workerData });
}


//coordinator.ejs ma select subject ni value thi subjectId madse jenathi apre ae subjects na coordinators return karisu
async function getCoordinator(req, res) {
    let coordinatorData = await adminServices.getCoordinator(req.body);
    res.json({ success: 1, coordinatorData });
}

//badha j subjects fetch karine pass karse quiz.ejs ma 
async function quiz(req, res) {
    let errors = null;
    if (req.session.errors) {
        errors = req.session.errors;
        req.session.errors = null;
    }
    let subData = await adminServices.fetchSubjects();
    res.render("./admin/quiz", { subData, errors });
}

//filter karva date and subject pass karyu getQuiz function ma
async function getQuiz(req, res) {
    let quizData = await adminServices.getQuiz(req.body);
    let allAnalysis = await coordinatorServices.allAnalysis(quizData);

    res.json({ success: 1, quizData: quizData, allAnalysis });
}


//particular quiz ni id params mathi laine badhi details return karse ae quiz ni quizDetail.ejs ma
async function quizDetails(req, res) {
    // console.log(req.params.quizId);
    let errors = null;
    if (req.session.errors) {
        errors = req.session.errors;
        req.session.errors = null;
    }
    let quiz = await adminServices.quizDetails(req.params.quizId);
    res.render("./admin/quizDetails", { quiz: quiz, errors: errors });
}

async function getGroups(req, res) {
    let errors = null;
    if (req.session.errors) {
        errors = req.session.errors;
        req.session.errors = null;
    }
    let dept_data = await adminServices.fetchDepartments();
    let group_data = await adminServices.fetchGroups();
    res.render("./admin/groups", {
        dept_data: dept_data,
        group_data: group_data,
        errors,
    });
}

async function addGroup(req, res) {
    let mySheet = xlsx.readFile("./public/files/schema.xlsx");
    let sheets = mySheet.SheetNames;
    let obj = xlsx.utils.sheet_to_json(mySheet.Sheets[sheets[0]]);
    if (obj[0]["Enrollment No"] === undefined) {
        req.session.errors = {
            text: "No (Enrollment No) field",
            icon: "warning",
        };
    } else {
        let group = await adminServices.addGroup(req.body.group, obj);
        if (group) {
            req.session.errors = {
                text: `Group Created Successfully`,
                icon: "success",
            };
        } else {
            req.session.errors = {
                text: "File Error",
                icon: "error",
            };
        }
    }
    res.redirect("/admin/groups");
}
async function viewGroup(req, res) {
    let students = await adminServices.viewGroup(req.body.group);

    res.json(students.students);
}

//finds certificate with subID,workerID,sessionID withquizID from certificates table and pass data to certificates.ejs
async function certificatesController(req, res) {
    let myCertificates = await certificates
        .find({})
        .populate("subjectId")
        .populate("workerId")
        .populate({ path: "sessionId", populate: { path: "quizId" } });
    res.render("./admin/certificates", { myCertificates });
}


//particular quiz na analysis mate ena params ma quizID laine report generate thase
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
    // console.log(marksChart);
    // res.json({quiz,worker});
    res.render("./admin/reportPage", {
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

//query mathi test ni type lese ena according graph create karse
async function generalAnalysis(req, res) {
  
    let tests = await quizzes
        .find({ type: req.query.type })
        .populate("subjectId");
        let myMap = new Map();
    for (let index = 0; index < tests.length; index++) {
        const element = tests[index];
        let sessionc = await sessions
            .count({ quizId: element._id })
        // console.log(session);
        let approvedc = await sessions
            .count({
                quizId: element._id,
                is_evaluated: 1,
            })
        let rejectedc = await sessions
            .count({
                quizId: element._id,
                is_evaluated: -1,
            })
        
        if (myMap.get(element.subjectId._id.toString())) {
            let myObj = myMap.get(element.subjectId._id.toString());
            myObj.tests += sessionc;
            myObj.approved += approvedc;
            myObj.rejected += rejectedc;
            myMap.set(element.subjectId._id.toString(), myObj);
        } else {
            myObj = {
                tests: 0,
                approved: 0,
                rejected: 0,
                subject: element.subjectId.name,
            };
            myObj.tests += sessionc;
            myObj.approved += approvedc;
            myObj.rejected += rejectedc;
            myMap.set(element.subjectId._id.toString(), myObj);
        }
    }
    res.render("./admin/generalAnalysis", { myArr:Array.from(myMap), type: req.query.type });

    
}

async function createQuiz(req, res) {
    res.render("./admin/addQuiz1");
}
async function setQuiz(req, res) {
    req.session.quiz = req.body;
    let cookie = req.cookies.auth;
    let id = jwt.verify(cookie, process.env.JWT_SECRET);
    let data = req.body;
    data.created_by = id.id;
    data.type = 3;
    let setQuiz = await adminServices.setQuiz(data);
    req.session.quizId = setQuiz;
    res.json({ success: 1 });
}

async function addQuizQuestion(req, res) {
    let data = await adminServices.addQuizQuestionData();
    let marks_questions = req.session.quiz.marks_questions;
    console.log(JSON.stringify(data));
    res.render("./admin/addQuiz3", {
        data,
        marks_questions,
        
    });
    // res.json({data,marks_questions});
}
async function setQuestions(req, res) {
    let myArr = [];
    let marks_question = req.session.quiz.marks_questions;
    let selectedQuestions = req.body.selectedQuestions;
    console.log(selectedQuestions);
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
    res.render("./admin/addQuiz4", {
        marks_questions,
        allQuestions,
        allQuestionsString,
    });
}
async function setCompulsaryQuestionsPost(req, res) {
    let selectedQuestions = req.body.selectedQuestions;
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

async function myQuiz(req, res)
{
    let cookie = req.cookies.auth;
    let id = jwt.verify(cookie, process.env.JWT_SECRET)["id"];
    let quizData = await adminServices.getMyQuiz(id);
    res.render("./admin/myQuiz", {quizData});
}
async function downloadReport(req, res) {
    let quizId = req.params.quizId;
    let excelObject = await coordinatorServices.downloadReport(
        quizId,
    );
    let newSheet = xlsx.utils.json_to_sheet(excelObject);
    let newBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(newBook, newSheet, "Report");
    let filename2 = `files/reports/${Date.now()}.xlsx`;
    let filename = `./public/` + filename2;
    await xlsx.writeFile(newBook, filename);
    res.redirect(`http://localhost:3000/${filename2}`);
}
module.exports = {
    downloadReport,
    addAuthority,
    adminDashboard,
    addSubject,
    authorities,
    addStudent,
    subjects,
    workers,
    coordinators,
    addCoordinator,
    deleteDepartment,
    getSubject,
    getWorker,
    getCoordinator,
    quiz,
    getQuiz,
    quizDetails,
    deleteSubject,
    deleteStudent,
    getGroups,
    addGroup,
    viewGroup,
    certificatesController,
    generateReport,
    generalAnalysis,
    createQuiz,
    setQuiz,
    addQuizQuestion,
    setQuestions,
    setCompulsaryQuestions,
    setCompulsaryQuestionsPost,
    myQuiz,
    leaderboard,
    getQuizzes,
    subjectAnalysis,
    subjectAnalysisPost,
    scoreAnalysis
};
