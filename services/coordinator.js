const administrations = require("../models/administrations");
// const students = require("../models/students");
// const groups = require("../models/groups");
// const sessions = require("../models/sessions");
const modules = require("../models/modules");
const subjects = require("../models/subjects");
const workers = require("../models/workers");
const questions = require("../models/questions");
const topics = require("../models/topics");
// const departments = require("../models/departments");
// const courseOutcomes = require("../models/courseOutcomes");
const quizzes = require("../models/quizzes");
const sessions = require("../models/sessions");
const certificates = require("../models/certificates");
const session = require("express-session");
const ratings = require("../models/ratings");
const workerServices = require("./worker");
const comments = require("../models/comments");
// const { default: mongoose } = require("mongoose");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
const mailer = require("../controllers/mailer");
const reminders = require("../models/reminders");

async function allSubjectFetch() {
    let data = await subjects.find({});
    return data;
}
async function loginFetch(username, password) {
    let data = await administrations.findOne({
        username: username,
        password: password,
    });
    return data;
}

async function subjectFetch(coordinatorId) {
    let subData = await administrations
        .findOne({ _id: coordinatorId })
        .populate("subjectIds");
    for (let index = 0; index < subData.subjectIds.length; index++) {
        const element = subData.subjectIds[index];
        element.modulesCount = await noOfModules(element._id);
    }
    return subData;
}
async function noOfModules(subjectId) {
    let moduleData = await modules.count({ subjectId: subjectId });
    return moduleData;
}

async function getTopics(topicObject) {
    let topic = await topics
        .find(
            {
                moduleId: topicObject.module,
            },
            { content: 0 }
        )
        .populate("moduleId")
        .sort({ order: 1 });
    return topic;
}

async function topicDetail(data) {
    let topicDetail = await topics.findById(data).populate({
        path: "moduleId",
        model: "modules",
        populate: {
            path: "subjectId",
            model: "subjects",
            // populate: {
            //     path: "subjectId",
            //     model: "subjects",
            // },
        },
    });

    // console.log(questionDetail);
    return topicDetail;
}

async function addQuestion(quesobject) {
    let question = new questions(quesobject);
    await question.save();
    let module = await modules
        .findOne({
            topics: question.topicId[0],
        })
        .populate("subjectId");
    let practiceTest = await quizzes.findOne({ moduleId: module._id, type: 0 });
    practiceTest.random_questions.push({ marks: 1, question: question.id });
    await practiceTest.save();
    let trainingTest = await quizzes.findOne({
        subjectId: module.subjectId._id,
        type: 1,
    });
    trainingTest.random_questions.push({ marks: 1, question: question._id });
    await trainingTest.save();
    return question._id;
}
async function addQuestionFile(questionId, filePath, description) {
    let question = await questions.findOne({ _id: questionId });
    if (question) {
        question.files.push({ description: description, file: filePath });
        await question.save();
    }
}

async function getQuestion(data, id) {
    let questionData = null;
    let createdby = data.createdby == "All" ? { $exists: true } : id;
    let type = data.type == "All" ? { $exists: true } : data.type;
    let mark = data.mark == "All" ? { $exists: true } : data.mark;
    let topic = data.topic == "All" ? { $exists: true } : { $in: data.topic };

    let module =
        data.module == "All"
            ? { $and: [{ moduleId: { $exists: true } }] }
            : {
                  $and: [
                      { moduleId: { $exists: true } },
                      { moduleId: { $eq: data.module } },
                  ],
              };
    let difficulty =
        data.difficulty == "All" ? { $exists: true } : data.difficulty;
    let subject =
        data.subject == "All"
            ? { $and: [{ subjectId: { $exists: true } }] }
            : {
                  $and: [
                      { subjectId: { $exists: true } },
                      { subjectId: { $eq: data.subject } },
                  ],
              };
    questionData = await questions
        .find({
            topicId: topic,
            marks: mark,
            created_by: createdby,
            type: type,
            difficulty: difficulty,
            is_active: 1,
        })
        .populate({
            path: "topicId",
            model: "topics",
            populate: {
                path: "moduleId",
                model: "modules",
                match: { $and: [subject] },
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
    return questionData;
}

async function questionDetail(data) {
    let questionDetail = await questions
        .findById(data)
        .populate({
            path: "topicId",
            model: "topics",
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
    // console.log(questionDetail);
    return questionDetail;
}
async function getCOs(data) {
    console.log(data);
    let coData = await subjects.findOne({ _id: data });

    return coData;
}

async function setQuiz(data) {
    let quiz = new quizzes(data);
    await quiz.save();

    let today = new Date();
    let worker = await workers
        .find(
            {
                enrolledSubjects: {
                    $elemMatch: {
                        subject: quiz.subjectId,
                        endDate: { $gt: today },
                    },
                },
            },
            { _id: 1 }
        )
        .lean();
    worker = worker.map((ele) => ele._id);
    //There is a new upcoming quiz
    let date = new Date(data.visible_from);
    let title = "New Upcoming Quiz";
    let message = `${quiz.name} is a new upcoming quiz`;
    setReminder(date, message, title, worker);

    //quiz is now available
    let date2 = new Date(quiz.valid_from);
    console.log(date2);
    setReminder(date2, `${quiz.name} has started`, `Quiz Reminder`, worker);
    //before 30 mins
    date2 = new Date(date2.getTime() - 1800000);
    setReminder(
        date2,
        `${quiz.name} will be start in 30 mins`,
        `Quiz Reminder`,
        worker
    );
    //before 1 day
    console.log(date2);
    date2 = date2.getTime() - 86400000 + 1800000;
    setReminder(
        date2,
        `${quiz.name} will be start in 1 day`,
        `Quiz Reminder`,
        worker
    );

    return quiz._id;
}

async function setReminder(date, message, title, workerIds) {
    let reminder = new reminders({
        date,
        message,
        title,
        workerIds,
        issent: 0,
    });
    await reminder.save();
}

async function setQuestions(data, quizId) {
    let quiz = await quizzes.findOne({ _id: quizId });
    quiz.random_questions = data;
    await quiz.save();
}
async function setCompulsaryQuestionsPost(
    id,
    compulsaryQuestions,
    randomQuestions
) {
    let quiz = await quizzes.findOne({ _id: id });
    quiz.compulsary_questions = compulsaryQuestions;
    quiz.random_questions = randomQuestions;
    await quiz.save();
}
async function getMyQuiz(data, id) {
    const nextDate = new Date();
    const date = new Date(data.date);
    date.setTime(date.getTime() - 19800000);
    nextDate.setTime(date.getTime() + 86400000);
    let datequery =
        data.date == ""
            ? { _id: { $exists: true } }
            : {
                  $and: [
                      { valid_from: { $gte: date } },
                      { valid_from: { $lte: nextDate } },
                  ],
              };

    let subjectquery =
        data.subject == "All"
            ? { subjectId: { $exists: true } }
            : { subjectId: data.subject };
    let createdbyquery = { created_by: id };
    // let quiz=await quizzes.find({$and:[{subject_id:subject},{date}]});
    let quiz = await quizzes
        .find({
            $and: [subjectquery, datequery, createdbyquery],
        })
        .sort({ createdAt: -1 });
    return quiz;
}
async function getAllQuiz(data, id) {
    const nextDate = new Date();
    const date = new Date(data.date);
    date.setTime(date.getTime() - 19800000);
    nextDate.setTime(date.getTime() + 86400000);
    let datequery =
        data.date == ""
            ? { _id: { $exists: true } }
            : {
                  $and: [
                      { valid_from: { $gte: date } },
                      { valid_from: { $lte: nextDate } },
                  ],
              };

    let subjectquery =
        data.subject == "All"
            ? { subjectId: { $exists: true } }
            : { subjectId: data.subject };
    // let quiz=await quizzes.find({$and:[{subject_id:subject},{date}]});
    let quiz = await quizzes
        .find({ $and: [subjectquery, datequery, { type: 2 }] })
        .populate("created_by")
        .sort({ createdAt: -1 });
    console.log(quiz);
    return quiz;
}
async function quizDetails(data) {
    let quiz = await quizzes
        .findOne({ _id: data })
        .populate("random_questions.question")
        .populate("compulsary_questions.question")
        .populate("subjectId");
    return quiz;
}
async function fetchWorkers(coordinatorId) {
    let subs = await subjectFetch(coordinatorId);
    let today = new Date();
    let myArr = [];
    for (let index = 0; index < subs.subjectIds.length; index++) {
        const element = subs.subjectIds[index];
        let worker = await workers
            .find({
                is_active: 1,
                enrolledSubjects: {
                    $elemMatch: {
                        subject: element._id,
                        endDate: { $gt: today },
                    },
                },
            })
            .populate("districtId")
            .lean();
        worker = worker.map(ele=>({...ele, subject:element.name}))
        myArr.push(...worker);
    }
    return myArr;
}

async function getModules({ subjectId }) {
    let module = await modules
        .find({ subjectId: subjectId })
        .sort({ order: 1 });
    let myArr = [];
    for (let index = 0; index < module.length; index++) {
        const element = module[index];
        let rating = await ratings.count({ moduleId: element._id });
        myArr.push(rating);
    }
    return [module, myArr];
}

async function getModuleFromModuleId(moduleId) {
    let module = await modules.findOne({ _id: moduleId }).populate("subjectId");
    return module;
}
async function modulesOrder(module) {
    for (let index = 0; index < module.length; index++) {
        const element = module[index];
        let newModule = await modules.findOne({ _id: element._id });
        newModule.order = element.newOrder;
        await newModule.save();
    }
}
async function topicsOrder(topic) {
    for (let index = 0; index < topic.length; index++) {
        const element = topic[index];
        let newTopic = await topics.findOne({ _id: element._id });
        newTopic.order = element.newOrder;
        await newTopic.save();
    }
}

//quizID thi badhi quiz and badha worker ni details find karse pachi analysis karine return karse
async function generateReport(quizId, districtId = { $exists: true }) {
    let quiz = await quizzes
        .findOne({ _id: quizId })
        .populate("created_by")
        .populate("updated_by")
        .populate("subjectId")
        .populate("moduleId");

    let worker = await sessions
        .find({ quizId: quizId })
        .populate({
            path: "questions_answers.question",
            select: { question: 0 },
            populate: {
                path: "topicId",
                model: "topics",
                select: { content: 0 },
                populate: { path: "moduleId", model: "modules" },
            },
        })
        .populate({
            path: "workerId",
            match: { districtId },
            populate: { path: "certificates", model: "certificates" },
        })
        .lean();
    //worker= workers array jemne ae quiz api
    //console.log(JSON.stringify(worker));
    worker = worker.filter((ele) => ele.workerId != null);
    let workerArray = []; //particular worker ni badhi details store thases
    worker.forEach((worker) => {
        // console.log(worker);
        let marksObtained = 0;
        //evaluation kase ketla marks madya particular worker ne
        worker.questions_answers.forEach((obj) => {
            if (obj.question.caseSensitive == 1) {
                if (obj.question.answer == obj.answer) {
                    marksObtained += obj.question.marks;
                }
            } else {
                if (
                    obj.question.answer.toUpperCase() ==
                    obj.answer.toUpperCase()
                ) {
                    marksObtained += obj.question.marks;
                }
            }
        });
        //console.log(marksObtained);
        workerArray.push({
            name: worker.workerId.name,
            username: worker.workerId.username,
            marksObtained,
            email: worker.workerId.email,
            aadharCard: worker.workerId.aadharCard,
            phone: worker.workerId.phone,
            marks: marksObtained,
            age: Math.floor(
                (new Date() - new Date(worker.workerId.dateOfBirth)) /
                    31556952000
            ),
            status: worker.status,
            dateGiven: worker.start_time,
            evaluated: worker.is_evaluated,
            sessionId: worker._id,
        });
    });
    let totalSubmittedWorker = workerArray.filter(
        (ele) => ele.status == 1
    ).length;
    let moduleMarksa = await moduleMarks(worker, quiz.subjectId._id); //particular modules ma kevo performance
    let difficultyMarksa = await difficultyMarks(worker); //difficulty wise report
    let timeDifficultya = await timeDifficulty(worker); //time spent and time required (difficulty wise analysis)
    let timeModulesa = await timeModules(worker, quiz.subjectId._id); //time spent in modules
    let statusAnalysisa = await statusAnalysis(workerArray); //pie chart (status chart)
    let marksAnalysisa = await marksAnalysis(workerArray); //histogram (worker ketla marks score karya)
    //console.log(marksAnalysisa);
    //console.log(quiz);
    if (totalSubmittedWorker > 0) {
        for (let index = 0; index < timeDifficultya.length; index++) {
            let element = timeDifficultya[index];
            element.timeRequired = (
                element.timeRequired / totalSubmittedWorker
            ).toFixed(0);
            element.timeSpent = (
                element.timeSpent / totalSubmittedWorker
            ).toFixed(0);
        }
        for (let index = 0; index < timeModulesa.length; index++) {
            let element = timeModulesa[index];
            element[1].timeRequired = (
                element[1].timeRequired / totalSubmittedWorker
            ).toFixed(0);
            element[1].timeSpent = (
                element[1].timeSpent / totalSubmittedWorker
            ).toFixed(0);
        }
    }

    let total = 0;
    quiz.marks_questions.forEach((ele) => {
        total += ele.marks * ele.count;
    });
    // console.log(timeModulesa);
    return [
        quiz,
        workerArray,
        statusAnalysisa,
        marksAnalysisa,
        moduleMarksa,
        difficultyMarksa,
        timeDifficultya,
        timeModulesa,
        total,
    ];
}

//badha worker na marks laine array return karse
//map use thaine table banse
//marks obtained | how many students obtained this marks
//30|5
//40|2
async function marksAnalysis(workerArray) {
    let myArr = new Map();
    workerArray.forEach((ele) => {
        if (myArr.get(ele.marksObtained)) {
            myArr.set(ele.marksObtained, myArr.get(ele.marksObtained) + 1);
        } else {
            myArr.set(ele.marksObtained, 1);
        }
    });
    return Array.from(myArr);
}

//worker ni details avse badhi as input and status return thase
async function statusAnalysis(workerArray) {
    //0=Pending,1=Submitted,2=Disqualify//pie chart output ma ejs ma hase
    let myArr = [
        { status: 0, num: 0 },
        { status: 1, num: 0 },
        { status: 2, num: 0 },
    ];
    workerArray.forEach((ele) => {
        myArr[ele.status].num++;
    });
    return myArr;
}

//worker ni badhi details and subject input che
//output:badha modules ma ketla marks aya
async function moduleMarks(workerObj, subjectId) {
    let module = await modules.find({ subjectId: subjectId });
    let myMap = new Map();
    module.forEach((ele) => {
        myMap.set(ele._id.toString(), {
            moduleName: ele.moduleName,
            totalMarks: [0, 0, 0],
            marksObtained: [0, 0, 0],
        });
    });
    workerObj.forEach((worker) => {
        worker.questions_answers.forEach((question) => {
            let moduleIdofThisQuestion =
                question.question.topicId[0].moduleId._id;
            let marks = 0;
            let difficulty = question.question.difficulty;
            let markOfThisQuestion = question.question.marks;
            if (question.question.caseSensitive == 1) {
                if (question.question.answer == question.answer) {
                    marks = markOfThisQuestion;
                }
            } else {
                if (
                    question.question.answer.toUpperCase() ==
                    question.answer.toUpperCase()
                ) {
                    marks = markOfThisQuestion;
                }
            }
            let myModuleObject = myMap.get(moduleIdofThisQuestion.toString());
            myModuleObject.totalMarks[difficulty - 1] += markOfThisQuestion;
            myModuleObject.marksObtained[difficulty - 1] += marks;
            myMap.set(moduleIdofThisQuestion.toString(), myModuleObject);
        });
    });
    return Array.from(myMap);
}

//finds total marks and obtained marks difficulty wise and returns array
//input : worker details
//output: difficulty wise kaya question ma ketlo score karyo
async function difficultyMarks(workerObj) {
    let myArr = [
        { difficulty: "Easy", totalMarks: 0, marksObtained: 0 },
        { difficulty: "Medium", totalMarks: 0, marksObtained: 0 },
        { difficulty: "Hard", totalMarks: 0, marksObtained: 0 },
    ];
    workerObj.forEach((worker) => {
        //1-MCQ , 2-ONE_WORD , 3-DESCRIPTIVE
        worker.questions_answers.forEach((question) => {
            let difficultyOfThisQuestion = question.question.difficulty;
            let marks = 0;
            let markOfThisQuestion = question.question.marks;
            if (question.question.caseSensitive == 1) {
                if (question.question.answer == question.answer) {
                    marks = markOfThisQuestion;
                }
            } else {
                if (
                    question.question.answer?.toUpperCase() ==
                    question.answer.toUpperCase()
                ) {
                    marks = markOfThisQuestion;
                }
            }
            // console.log(difficultyOfThisQuestion);
            myArr[difficultyOfThisQuestion - 1].totalMarks +=
                markOfThisQuestion;
            myArr[difficultyOfThisQuestion - 1].marksObtained += marks;
        });
    });
    // console.log(myArr);
    return myArr;
}

//time spent and required is calculated of each worker
//input : worker details
//output : time spent and required for each question of each worker is returned
async function timeDifficulty(workerObj) {
    let myArr = [
        { difficulty: "Easy", timeSpent: 0, timeRequired: 0 },
        { difficulty: "Medium", timeSpent: 0, timeRequired: 0 },
        { difficulty: "Hard", timeSpent: 0, timeRequired: 0 },
    ];
    workerObj.forEach((worker) => {
        worker.questions_answers.forEach((question) => {
            let difficultyOfThisQuestion = question.question.difficulty;
            myArr[difficultyOfThisQuestion - 1].timeSpent +=
                question.time_spent;
            myArr[difficultyOfThisQuestion - 1].timeRequired +=
                question.question.time_required;
        });
    });
    // console.log(myArr);
    return myArr;
}

//input: worker details and subjectID
//output:each module ma ketlo time spend karyo
async function timeModules(workerObj, subjectId) {
    let module = await modules.find({ subjectId: subjectId });
    let myMap = new Map();
    module.forEach((ele) => {
        myMap.set(ele._id.toString(), {
            moduleName: ele.moduleName,
            timeSpent: 0,
            timeRequired: 0,
        });
    });
    workerObj.forEach((worker) => {
        worker.questions_answers.forEach((question) => {
            let moduleIdofThisQuestion =
                question.question.topicId[0].moduleId._id;
            let myModuleObject = myMap.get(moduleIdofThisQuestion.toString());
            myModuleObject.timeSpent += question.time_spent;
            myModuleObject.timeRequired += question.question.time_required;
            myMap.set(moduleIdofThisQuestion.toString(), myModuleObject);
        });
    });
    return Array.from(myMap);
}

async function approve(sessionId) {
    let worker = await sessions
        .findOne({ _id: sessionId })
        .populate({
            path: "workerId",
            populate: { path: "districtId", model: "districts" },
        })
        .populate({
            path: "questions_answers.question",
            populate: {
                path: "topicId",
                model: "topics",
                populate: { path: "moduleId", model: "modules" },
            },
        })
        .populate("quizId");
    return worker;
}

async function approveCertificate(sessionId, myMessage) {
    let session = await sessions.findOne({ _id: sessionId }).populate({
        path: "quizId",
        select: { subjectId: 1 },
        populate: { path: "subjectId" },
    });
    session.is_evaluated = 1;
    session.status = 1;
    await session.save();
    let certificate = new certificates({
        sessionId: session._id,
        subjectId: session.quizId.subjectId._id,
        type: 1,
        workerId: session.workerId,
    });
    await certificate.save();
    let worker = await workers.findOne({ _id: session.workerId });
    worker.certificates.push({
        certificateType: 1,
        certificate: certificate._id,
    });
    await worker.save();

    let mailDetails = {
        from: "avcthehero@gmail.com",
        to: worker.email,
        subject: "Certificate Approved",
        html: `${myMessage}`,
    };
    let msg = await mailer.sendMail(mailDetails);
    setReminder(
        new Date(),
        `Your Certificate for ${session.quizId.subjectId.name} Final Test has been Approved`,
        "Certificate Approved",
        [session.workerId]
    );
    return [
        session.quizId._id,
        certificate,
        worker.name,
        session.quizId.subjectId.name,
    ];
}

async function rejectCertificate(sessionId, myMessage) {
    let session = await sessions
        .findOne({ _id: sessionId })
        .populate("workerId")
        .populate({
            path: "quizId",
            select: { subjectId: 1 },
            populate: { path: "subjectId", select: { name: 1 } },
        });
    // return 0;
    session.is_evaluated = -1;
    await session.save();

    let mailDetails = {
        from: "avcthehero@gmail.com",
        to: session.workerId.email,
        subject: "Certificate rejected",
        html: `${myMessage}`,
    };
    let msg = await mailer.sendMail(mailDetails);
    setReminder(
        new Date(),
        `Your Certificate for ${session.quizId.subjectId.name} Final Test has been Rejected`,
        "Certificate Rejected",
        [session.workerId]
    );

    return session.quizId;
}

async function moduleTestAnalysis(module) {
    let myModules = module;
    let myArr = [];
    myModules.forEach((mod) => {
        myArr.push({
            moduleId: mod._id,
            moduleName: mod.moduleName,
            totalTests: 0,
            pendingTests: 0,
            submittedTests: 0,
            performance: 0,
        });
    });
    for (let index = 0; index < myArr.length; index++) {
        const element = myArr[index];
        let quiz = await quizzes.findOne({
            type: 0,
            moduleId: element.moduleId,
        });
        let worker = await sessions.find({ quizId: quiz._id }).populate({
            path: "questions_answers.question",
            select: { question: 0 },
            populate: {
                path: "topicId",
                model: "topics",
                select: { content: 0 },
                populate: { path: "moduleId", model: "modules" },
            },
        });
        let marks = await difficultyMarks(worker);
        // console.log(marks);
        let totalMarksObtained = 0;
        let marksObtained = 0;
        marks.forEach((ele) => {
            totalMarksObtained += ele.totalMarks;
            marksObtained += ele.marksObtained;
        });
        if (totalMarksObtained == 0) {
            totalMarksObtained = 1;
        }
        let total = await sessions.count({ quizId: quiz._id });
        let pending = await sessions.count({ quizId: quiz._id, status: 0 });
        element.totalTests = total;
        element.pendingTests = pending;
        element.submittedTests = total - pending;
        element.performance = (marksObtained / totalMarksObtained) * 100;
    }
    return myArr;
}

async function topicAnalysis(topic) {
    let myTopics = topic;
    let myArr = [];
    myTopics.forEach((topic) => {
        myArr.push({
            topic: topic.topic,
            bookmarked: 0,
            viewed: 0,
            topicId: topic._id,
        });
    });
    for (let index = 0; index < myArr.length; index++) {
        const element = myArr[index];
        let completed = await workers.count({
            "topicsCompleted.topic": element.topicId,
        });
        let bookmarked = await workers.count({
            "topicsBookmarked.topic": element.topicId,
        });
        element.bookmarked = bookmarked;
        element.viewed = completed;
    }
    return myArr;
}

async function deleteQuestion(questionId) {
    let question = await questions.findOne({ _id: questionId });
    question.is_active = 0;
    await question.save();
    return;
}

async function allAnalysis(quiz, districtId = { $exists: true }) {
    let myArr = [];
    for (let index = 0; index < quiz.length; index++) {
        const element = quiz[index];
        let worker = await sessions
            .find({ quizId: element._id })
            .populate({
                path: "questions_answers.question",
                select: { question: 0 },
                populate: {
                    path: "topicId",
                    model: "topics",
                    select: { content: 0 },
                    populate: { path: "moduleId", model: "modules" },
                },
            })
            .populate({ path: "workerId", match: { districtId: districtId } })
            .lean();

        let workerCount = await workers.count({
            districtId: districtId,
            enrolledSubjects: {
                $elemMatch: {
                    subject: element.subjectId._id,
                    $or: [
                        {
                            startDate: { $lte: element.valid_to },
                            endDate: { $gte: element.valid_from },
                        },
                        {
                            startDate: {
                                $gte: element.valid_from,
                                $lte: element.valid_to,
                            },
                        },
                    ],
                },
            },
        });
        worker = worker.filter((ele) => ele.workerId != null);
        let myArr2 = worker.map((ele) => ele.workerId._id.toString());
        var unique = myArr2.filter(
            (value, index, array) => array.indexOf(value) === index
        );
        let marks = await difficultyMarks(worker);
        // console.log(marks);
        let totalMarksObtained = 0;
        let marksObtained = 0;
        let participants = worker.length;
        let certificates = worker.filter((ele) => ele.is_evaluated == 1).length;
        let rejected = worker.filter((ele) => ele.is_evaluated == -1).length;
        marks.forEach((ele) => {
            totalMarksObtained += ele.totalMarks;
            marksObtained += ele.marksObtained;
        });
        if (totalMarksObtained == 0) {
            totalMarksObtained = 1;
        }
        myArr.push({
            name: element.name,
            totalMarksObtained,
            marksObtained,
            participants,
            certificates,
            rejected,
            attendance: ((unique.length / workerCount) * 100).toFixed(2),
        });
    }
    return myArr;
}

async function moduleLeaderboard(moduleId) {
    let quizId = await quizzes.findOne({ type: 0, moduleId });
    let data = await workerServices.leaderboard(quizId._id);
    return data;
}

async function getFeedback(moduleId) {
    let feedbacks = await ratings
        .find({ moduleId })
        .populate({ path: "workerId", populate: { path: "districtId" } });
    return feedbacks;
}

async function downloadReport(quizId, districtId = { $exists: true }) {
    let quizId1 = await quizzes.findOne({ _id: quizId });
    let worker = await sessions
        .find({ quizId: quizId1._id })
        .populate({
            path: "workerId",
            populate: { path: "districtId", match: { _id: districtId } },
        })
        .populate({
            path: "questions_answers.question",
            select: { question: 0 },
        })
        .sort({ start_time: 1 })
        .lean();
    worker = worker.filter((ele) => ele.workerId.districtId != null);
    let arrayOfObject = [];
    worker.forEach((ele, ind) => {
        let srno = ind + 1;
        let username = ele.workerId.username;
        let date = new Date(ele.end_time).toLocaleString();
        let { marks, totalMarks } = calculateMarks(ele);
        let status = null;
        if (ele.status == 1) {
            status = "SUBMITTED";
        } else if (ele.status == 0) {
            status = "PENDING";
        } else {
            status = "DISQUALIFIED";
        }
        let certificate = null;
        if (ele.is_evaluated == 1) {
            certificate = "APPROVED";
        } else if (ele.is_evaluated == -1) {
            certificate = "REJECTED";
        } else {
            certificate = "PENDING";
        }
        let district = ele.workerId.districtId.name;
        let email = ele.workerId.email;
        arrayOfObject.push({
            srno,
            username,
            date,
            marks,
            status,
            certificate,
            district,
            email,
        });
    });
    return arrayOfObject;
}
function calculateMarks(worker) {
    let marks = 0;
    let totalMarks = 0;
    worker.questions_answers.forEach((question) => {
        let markOfThisQuestion = question.question.marks;
        totalMarks += markOfThisQuestion;
        if (question.question.caseSensitive == 1) {
            if (question.question.answer == question.answer) {
                marks += markOfThisQuestion;
            }
        } else {
            if (
                question.question.answer?.toUpperCase() ==
                question.answer.toUpperCase()
            ) {
                marks += markOfThisQuestion;
            }
        }
    });
    return { marks, totalMarks };
}

async function getComments(topicId) {
    let comment = await comments
        .find({ topicId, is_reply: 0, is_active: 1 })
        .populate({ path: "workerId", select: { username: 1, photo: 1 } })
        .populate({
            path: "replies",
            populate: [
                { path: "workerId", select: { username: 1, photo: 1 } },
                { path: "administrationId", select: { username: 1 } },
            ],
        });
    return comment;
}

async function replyComment(administrationId, commentId, content) {
    let replyTo = await comments
        .findOne({ _id: commentId })
        .populate("topicId");
    let comment = new comments({
        administrationId,
        content,
        topicId: replyTo.topicId._id,
        is_active: 1,
        is_reply: 1,
    });
    await comment.save();
    setReminder(
        new Date(),
        `A Coordinator has replied to your comment in ${replyTo.topicId.topic} topic`,
        "Coordinator Reply",
        [replyTo.workerId]
    );
    replyTo.replies.push(comment._id);
    await replyTo.save();
}

module.exports = {
    loginFetch,
    getModules,
    getModuleFromModuleId,
    modulesOrder,
    subjectFetch,
    getTopics,
    topicsOrder,
    addQuestion,
    addQuestionFile,
    getQuestion,
    questionDetail,
    getCOs,
    setQuiz,
    setQuestions,
    setCompulsaryQuestionsPost,
    getMyQuiz,
    quizDetails,
    fetchWorkers,
    getAllQuiz,
    generateReport,
    allSubjectFetch,
    topicDetail,
    approve,
    approveCertificate,
    rejectCertificate,
    moduleTestAnalysis,
    topicAnalysis,
    deleteQuestion,
    allAnalysis,
    moduleLeaderboard,
    getFeedback,
    downloadReport,
    calculateMarks,
    getComments,
    replyComment,
};
