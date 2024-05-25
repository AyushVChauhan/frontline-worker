const certificates = require("../models/certificates");
const quizzes = require("../models/quizzes");
const sessions = require("../models/sessions");
const workers = require("../models/workers");
const coordinatorServices = require("./coordinator");

async function scoreAnalysis(
    type,
    dateFrom,
    dateTo,
    districtId = { $exists: true }
) {
    let tests = await quizzes.find({ type }).populate("subjectId");
    let myMap = new Map();

    for (let index = 0; index < tests.length; index++) {
        const element = tests[index];
        let session = await sessions
            .find({
                quizId: element._id,
                status: 1,
                $and: [
                    { start_time: { $gte: dateFrom } },
                    { start_time: { $lte: dateTo } },
                ],
            })
            .populate({
                path: "questions_answers.question",
                select: { question: 0 },
            })
            .populate({
                path: "workerId",
                populate: [{ path: "districtId", match: { _id: districtId } }],
            })
            .lean();
        session = session.filter((ele) => ele.workerId.districtId != null);
        let marksObtained = 0;
        let totalMarks = 0;
        for (let index = 0; index < session.length; index++) {
            const element = session[index];
            let obj = coordinatorServices.calculateMarks(element);
            marksObtained += obj.marks;
            totalMarks += obj.totalMarks;
        }
        if (myMap.get(element.subjectId._id.toString())) {
            let myObj = myMap.get(element.subjectId._id.toString());
            myObj.totalMarks += totalMarks;
            myObj.marksObtained += marksObtained;
        } else {
            myObj = {
                totalMarks: totalMarks,
                marksObtained: marksObtained,
                subject: element.subjectId.name,
            };
            myMap.set(element.subjectId._id.toString(), myObj);
        }
    }
    return Array.from(myMap);
}

async function getQuiz({ datefrom, dateto, subject, type }, districtId) {
    let dateFrom = null;
    if (datefrom == "") {
        dateFrom = new Date(1970, 1, 1);
    } else {
        dateFrom = new Date(datefrom);
    }
    let dateTo = new Date(dateto);
    if (dateto == "") {
        dateTo = new Date(4000, 1, 1);
    } else {
        dateTo = new Date(dateto);
    }
    // console.log(dateFrom.toLocaleDateString(), dateTo.toLocaleDateString());
    let datequery = {
        $and: [
            { valid_from: { $gte: dateFrom } },
            { valid_from: { $lte: dateTo } },
        ],
    };
    if (type == 1) {
        datequery = { _id: { $exists: true } };
    }
    //input ma subject ayo ema check karse if all che ke particular subject ena according find karisu
    let subjectquery =
        subject == "All"
            ? { subjectId: { $exists: true } }
            : { subjectId: subject };
    let typequery = type == "All" ? { type: { $in: [1, 2] } } : { type: type };
    // let quiz=await quizzes.find({$and:[{subject_id:subject},{date}]});

    var quiz = await quizzes
        .find({ $and: [subjectquery, datequery, typequery] })
        .populate("created_by")
        .populate("subjectId")
        .lean();

    for (let index = 0; index < quiz.length; index++) {
        let element = quiz[index];
        let session = await sessions
            .find({ status: 1, quizId: element._id }, { workerId: 1 })
            .populate({
                path: "workerId",
                match: { districtId: districtId },
                select: { districtId: 1 },
            });
        element.quizGiven = session.filter(
            (ele) => ele.workerId != null
        ).length;
    }
    return quiz;
}

async function getQuizzes(datefrom, dateto, subject, type) {
    let datequery = {
        $and: [
            { valid_from: { $gte: datefrom } },
            { valid_from: { $lte: dateto } },
        ],
    };
    if (type == 1) {
        datequery = { valid_from: { $exists: true } };
    }
    //input ma subject ayo ema check karse if all che ke particular subject ena according find karisu
    let subjectquery =
        subject == "All"
            ? { subjectId: { $exists: true } }
            : { subjectId: subject };
    let typequery = type == "All" ? { type: { $in: [1, 2] } } : { type: type };
    // let quiz=await quizzes.find({$and:[{subject_id:subject},{date}]});

    var quiz = await quizzes.find(
        { $and: [subjectquery, datequery, typequery] },
        { _id: 1, name: 1 }
    );
    return quiz;
}

async function subjectAnalysis(
    type,
    dateFrom,
    dateTo,
    districtId = { $exists: true }
) {
    let tests = await quizzes.find({ type }).populate("subjectId");
    let myMap = new Map();

    for (let index = 0; index < tests.length; index++) {
        const element = tests[index];
        let session = await sessions
            .find({
                quizId: element._id,
                $and: [
                    { start_time: { $gte: dateFrom } },
                    { start_time: { $lte: dateTo } },
                ],
            })
            .populate({
                path: "workerId",
                populate: [{ path: "districtId", match: { _id: districtId } }],
            })
            .lean();
        let totalTestsGiven = session.filter(
            (ele) => ele.workerId.districtId != null
        ).length;
        let approved = session.filter(
            (ele) => ele.workerId.districtId != null && ele.is_evaluated == 1
        ).length;
        let rejected = session.filter(
            (ele) => ele.workerId.districtId != null && ele.is_evaluated == -1
        ).length;
        if (myMap.get(element.subjectId._id.toString())) {
            let myObj = myMap.get(element.subjectId._id.toString());
            myObj.tests += totalTestsGiven;
            myObj.approved += approved;
            myObj.rejected += rejected;
            myMap.set(element.subjectId._id.toString(), myObj);
        } else {
            let subId = element.subjectId._id;
            let worker = await workers.count(
                {
                    districtId: districtId,
                    enrolledSubjects: {
                        $elemMatch: {
                            subject: subId,
                            $or: [
                                {
                                    startDate: { $lte: dateTo },
                                    endDate: { $gte: dateFrom },
                                },
                                {
                                    startDate: { $gte: dateFrom, $lte: dateTo },
                                },
                            ],
                        },
                    },
                },
                { enrolledSubjects: 1 }
            );
            // let find1 = worker.filter((ele) => {});
            myObj = {
                tests: 0,
                approved: 0,
                rejected: 0,
                subject: element.subjectId.name,
                worker,
            };
            myObj.tests += totalTestsGiven;
            myObj.approved += approved;
            myObj.rejected += rejected;
            myMap.set(element.subjectId._id.toString(), myObj);
        }
    }
    return Array.from(myMap);
}

async function leaderboard(
    dateFrom,
    dateTo,
    districtId = { $exists: true },
    quiz
) {
    let worker = await sessions
        .find({
            quizId: quiz,
            status: 1,
            start_time: { $gte: dateFrom },
            start_time: { $lte: dateTo },
        })
        .populate({
            path: "questions_answers.question",
            select: { question: 0 },
        })
        .populate({
            path: "workerId",
            populate: [{ path: "districtId", match: { _id: districtId } }],
        })
        .lean();
    worker = worker.filter((ele) => ele.workerId.districtId != null);
    let myMap = new Map();
    worker.forEach((session) => {
        let marks = 0;
        let timeSpent = 0;
        let totalMarks = 0;
        session.questions_answers.forEach((question) => {
            let markOfThisQuestion = question.question.marks;
            if (question.question.caseSensitive == 1) {
                if (question.question.answer == question.answer) {
                    marks += markOfThisQuestion;
                }
            } else {
                if (
                    question.question.answer.toUpperCase() ==
                    question.answer.toUpperCase()
                ) {
                    marks += markOfThisQuestion;
                }
            }
            totalMarks += markOfThisQuestion;
            timeSpent += question.time_spent;
        });
        if (myMap.get(session.workerId._id.toString())) {
            let oldObj = myMap.get(session.workerId._id.toString());
            if (marks >= oldObj.marksObtained) {
                if (
                    marks == oldObj.marksObtained &&
                    timeSpent < oldObj.timeSpent
                ) {
                    myMap.set(session.workerId._id.toString(), {
                        username: session.workerId.username,
                        marksObtained: marks,
                        timeSpent,
                        date: session.end_time,
                        totalTimes: oldObj.totalTimes + 1,
                        totalMarks,
                        district: session.workerId.districtId.name,
                        _id: session.workerId._id,
                    });
                } else if (marks > oldObj.marksObtained) {
                    myMap.set(session.workerId._id.toString(), {
                        username: session.workerId.username,
                        marksObtained: marks,
                        timeSpent,
                        date: session.end_time,
                        totalTimes: oldObj.totalTimes + 1,
                        totalMarks,
                        district: session.workerId.districtId.name,
                        _id: session.workerId._id,
                    });
                } else {
                    let totalTimes = oldObj.totalTimes + 1;
                    myMap.set(session.workerId._id.toString(), {
                        ...oldObj,
                        totalTimes,
                    });
                }
            }
        } else {
            myMap.set(session.workerId._id.toString(), {
                _id: session.workerId._id,
                username: session.workerId.username,
                marksObtained: marks,
                timeSpent,
                date: session.end_time,
                totalTimes: 1,
                totalMarks,
                district: session.workerId.districtId.name,
            });
        }
    });
    let myArr = Array.from(myMap);
    myArr.sort(function (a, b) {
        return b[1].marksObtained - a[1].marksObtained;
    });
    myArr.sort((a, b) => {
        if (a[1].marksObtained == b[1].marksObtained) {
            return a[1].timeSpent - b[1].timeSpent;
        } else {
            return 0;
        }
    });
    return myArr;
}

async function performance(workerId, subjectId) {
    let quizId = null;
    let practiceQuizId = null;
    quizId = await quizzes.findOne({ subjectId, type: 1 }, { _id: 1 });
    practiceQuizId = await quizzes
        .find({ subjectId, type: 0 }, { _id: 1 })
        .lean();
    practiceQuizId = practiceQuizId.map((ele) => ele._id);
    let worker = await sessions
        .find({ quizId: quizId._id, workerId, status: 1 })
        .populate({
            path: "questions_answers.question",
            select: { question: 0 },
        })
        .sort({ end_time: -1 })
        .limit(5);
    let worker2 = await sessions
        .find({ quizId: { $in: practiceQuizId }, workerId, status: 1 })
        .populate({
            path: "questions_answers.question",
            select: { question: 0 },
        })
        .sort({ end_time: -1 })
        .limit(5);
    let myArr = [];
    worker.forEach((session) => {
        let marks = 0;
        let timeSpent = 0;
        let totalMarks = 0;
        session.questions_answers.forEach((question) => {
            let markOfThisQuestion = question.question.marks;
            if (question.question.caseSensitive == 1) {
                if (question.question.answer == question.answer) {
                    marks += markOfThisQuestion;
                }
            } else {
                if (
                    question.question.answer.toUpperCase() ==
                    question.answer.toUpperCase()
                ) {
                    marks += markOfThisQuestion;
                }
            }
            timeSpent += question.time_spent;
            totalMarks += markOfThisQuestion;
        });
        myArr.push({
            username: session.workerId.username,
            marksObtained: marks,
            timeSpent,
            date: session.end_time,
            totalMarks,
        });
    });
    let myArr2 = [];
    worker2.forEach((session) => {
        let marks = 0;
        let timeSpent = 0;
        let totalMarks = 0;
        session.questions_answers.forEach((question) => {
            let markOfThisQuestion = question.question.marks;
            if (question.question.caseSensitive == 1) {
                if (question.question.answer == question.answer) {
                    marks += markOfThisQuestion;
                }
            } else {
                if (
                    question.question.answer.toUpperCase() ==
                    question.answer.toUpperCase()
                ) {
                    marks += markOfThisQuestion;
                }
            }
            timeSpent += question.time_spent;
            totalMarks += markOfThisQuestion;
        });
        myArr2.push({
            username: session.workerId.username,
            marksObtained: marks,
            timeSpent,
            date: session.end_time,
            totalMarks,
        });
    });
    return [myArr.reverse(), myArr2.reverse()];
}

async function getWorkerDetails(workerId) {
    let worker = await workers
        .findOne({ _id: workerId })
        .populate("enrolledSubjects.subject");
    console.log(worker);
    console.log(JSON.stringify(worker.enrolledSubjects));
    return worker;
}

async function getCertificates(districtId) {
    let data = await certificates
        .find({})
        .populate("subjectId")
        .populate({ path: "workerId", match: { districtId: districtId } })
        .populate({ path: "sessionId", populate: { path: "quizId" } })
        .lean();
    return data.filter((ele) => ele.workerId != null);
}
module.exports = {
    getQuiz,
    subjectAnalysis,
    scoreAnalysis,
    leaderboard,
    getQuizzes,
    performance,
    getWorkerDetails,
    getCertificates,
};
