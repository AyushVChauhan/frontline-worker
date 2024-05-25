const mongoose = require("mongoose");
const districts = require("../models/districts");
const administrations = require("../models/administrations");
const workers = require("../models/workers");
const subjects = require("../models/subjects");
const modules = require("../models/modules");
const mailer = require("../controllers/mailer");
const md5 = require("md5");
const quizzes = require("../models/quizzes");
const sessions = require("../models/sessions");





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




//subject ni id laine database mathi find karse and is_active 0 karse so output ma nai dekhai
async function deleteSubject(id) {
    console.log(id);
    let data = await subjects.findOne({ _id: new mongoose.Types.ObjectId(id) });
    data.is_active = 0;
    await data.save();
    return data;
}

//badhi districts return karse and if district ma reference hase authorityID to ae bhi finde karse kai authority assigned che
async function fetchDistricts() {
    let authorities = await districts
        .find({
            is_active: 1,
        })
        .populate("authorityId");
    return authorities;
}

//districts table ma districts count karse jema already authority ref kareli hoi
async function countAuthority() {
    let district_count = await districts.count({
        is_active: 1,
        authorityId: { $exists: true },
    });
    return district_count;
}

//administrations table ma data add karse
//districtId thi district find karine ema authorityID assign karse so ae district ma aa authority no reference rese
//input:object of authority with all details
async function addAuthority({ name, username, email, phone, districtId }) {
    let authority = new administrations({
        name: name,
        username: username,
        email: email,
        phone: phone,
        districtId: districtId,
        is_active: 1,
        password: "123",
        role: 1,
    });
    await authority.save();
    let district = await districts.findOne({ _id: districtId });
    district.authorityId = authority._id;
    let mailDetails = {
        from: "avcthehero@gmail.com",
        to: email,
        subject: "Register as Authority",
        text: `you are successfully added as authority Here are your login credentials
                username:${username}
                password:123
                `,
        // html: `${myMessage}`,
      };
      let msg = await mailer.sendMail(mailDetails);
    await district.save();
}

// /* ------ SUBJECT ------- */
//find karse subject exist hoi to return 1 else subject add karse ae subject ni training test banavse jema random 30 questions hase 1 mark na
//input:subject name
async function addSubject({ subname }) {
    let subjectData = await subjects.findOne({ name: subname });
    if (subjectData) {
        return 1;
    } else {
        let subject = new subjects({
            name: subname,
            is_active: 1,
        });
        await subject.save();
        let quiz = new quizzes({
            is_active: 1,
            type: 1,
            marks_questions: [{ marks: 1, count: 30 }],
            duration: 30,
            random_questions: [],
            name: subject.name + " Training Test",
            subjectId: subject._id,
            valid_from: new Date(2023, 1, 1),
            valid_to: new Date(3023, 1, 1),
            visible_from: new Date(2023, 1, 1),
        });
        await quiz.save();
        return 0;
    }
}

//subjects table mathi subjects find thaine return karse
async function fetchSubjects() {
    let sub_data = await subjects.find({ is_active: 1 });
    return sub_data;
}

//subject table mathi number of subjects count thase
async function countSubjects() {
    let subject_count = await subjects.count({ is_active: 1 });
    return subject_count;
}

// /* ------ TEACHER ------- */
async function addCoordinator({ username, name, email, phone, subjectIds }) {
    let coordinatorData = await administrations.findOne({
        username: username,
    });
    if (coordinatorData) {
        return 1;
    } else {
        let coordinator = new administrations({
            username: username,
            name: name,
            is_active: 1,
            email: email,
            phone: phone,
            password: "123",
            role: 0,
            subjectIds: subjectIds,
        });
        let mailDetails = {
            from: "avcthehero@gmail.com",
            to: email,
            subject: "Register as coordinator",
            text: `you are successfully added as coordinator Here are your login credentials
                    username:${username}
                    password:123
                    `,
            // html: `${myMessage}`,
          };
          let msg = await mailer.sendMail(mailDetails);
        await coordinator.save();
        return 0;
    }
}

//administrations table ma coordinators find karse subject id sathe coordinators return thase
async function fetchCoordinators() {
    let coordinatorData = await administrations
        .find({ role: 0 })
        .populate("subjectIds");
    return coordinatorData;
}

//administration table ma jetla coordinator role hase ae count thaine return thase
async function countCoordinators() {
    let coordinator_count = await administrations.count({
        is_active: 1,
        role: 0,
    });
    return coordinator_count;
}
// // async function newcoordinator(name) {
// //     let data = new departments({ name: name, is_active: 1 });
// //     await data.save();
// //     return data;
// // }

// /* ------ STUDENT ------- */
// async function addStudent(enrollment, email, password, semester, department) {
//     let preData = await students.findOne({ enrollment: enrollment });
//     if (!preData) {
//         let record = 1;
//         //send mail
//         let mailDetails = {
//             from: "avcthehero@gmail.com",
//             to: email,
//             subject: "Registration",
//             text: `Hellow User Welcome to QuizApp \n Your Crendentials are:\nUsername:${enrollment}\nPassword:${password}`,
//         };
//         let msg = await mailer.sendMail(mailDetails);
//         console.log(enrollment + ":" + msg.accepted);
//         if (record) {
//             let data = new students({
//                 enrollment: enrollment,
//                 email: email,
//                 password: md5(password),
//                 semester: semester,
//                 department_id: new mongoose.Types.ObjectId(department),
//                 is_active: 1,
//             });
//             await data.save();
//         }
//         return record;
//     }
//     return 0;
// }
// function timeout(ms) {
//     return new Promise((resolve) => setTimeout(resolve, ms));
// }

//badha workers district sathe fetch thaine retrun karse
async function fetchWorkers() {
    let worker_data = await workers
        .find({ is_active: 1 })
        .populate("districtId");
    return worker_data;
}

//workers table ma number of worker count thase
async function countWorkers() {
    let worker_count = await workers.count({ is_active: 1 });
    return worker_count;
}

//if district all hase to badha district na worker avse otherwise selected district na workers avse
async function getWorker({ district }) {
    let workerData = null;
    let districtData = district == "All" ? { $exists: true } : district;
    workerData = await workers
        .find({
            districtId: districtData,
            is_active: 1,
        })
        .populate("districtId");

    return workerData;
}

//agar subjectID ma all hase to jetla coordinators hase ae badha return thase else ma particular subjects na coordinators return thase
async function getCoordinator({ subjectId }) {
    let coordinatorData = null;
    let subject =
        subjectId == "All"
            ? { $exists: true }
            : new mongoose.Types.ObjectId(subjectId);
    coordinatorData = await administrations
        .find({
            role: 0,
            is_active: 1,
            subjectIds: subject,
        })
        .populate("subjectIds");

    return coordinatorData;
}
// /* ------ QUIZZES ------ */
// async function countQuizzes() {
//     let quiz_count = await quizzes.count({ is_active: 1 });
//     return quiz_count;
// }

//input ma date and subject ayo ae laine filter apse and quiz return thase
async function getQuiz({ datefrom, dateto, subject, type }, districtId={$exists:true}) {
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
        datequery = {_id:{ $exists: true }};
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

//find the quiz from it's id and return with all question's details
async function quizDetails(data) {
    let quiz = await quizzes
        .findOne({ _id: data })
        .populate("random_questions.question")
        .populate("compulsary_questions.question")
        .populate("subjectId");
    return quiz;
}

async function setQuiz(data) {
    let quiz = new quizzes({
        is_active: 1,
        type: 3,
        marks_questions: data.marks_questions,
        duration: data.duration,
        name: data.name,
        valid_from: new Date(2023, 1, 1),
        valid_to: new Date(3023, 1, 1),
        visible_from: new Date(2023, 1, 1),
        created_by: data.created_by,
    });
    await quiz.save();
    return quiz._id;
}

async function addQuizQuestionData() {
    //get subjects
    let subject = await subjects.find({ is_active: 1 });
    let moduleFromSubjects = new Map();
    for (let index = 0; index < subject.length; index++) {
        const element = subject[index];
        let module = await modules
            .find({ subjectId: element._id })
            .populate({ path: "topics", select: { content: 0 } });
        moduleFromSubjects.set(element._id.toString(), {
            module,
            name: element.name,
        });
    }
    // console.log(moduleFromSubjects);
    return Array.from(moduleFromSubjects);
}

async function getMyQuiz(id){
    let quiz = await quizzes.find({created_by:id}).sort({valid_from:-1}).lean();
    for (let index = 0; index < quiz.length; index++) {
        let element = quiz[index];
        let session = await sessions
            .count({ status: 1, quizId: element._id })
        element.quizGiven = session;
    }
    return quiz;
}

module.exports = {
    countAuthority,
    countCoordinators,
    countSubjects,
    countWorkers,
    fetchDistricts,
    addAuthority,
    fetchSubjects,
    deleteSubject,
    addSubject,
    fetchCoordinators,
    getCoordinator,
    addCoordinator,
    fetchWorkers,
    getWorker,
    getQuiz,
    quizDetails,
    setQuiz,
    addQuizQuestionData,
    getMyQuiz,
    getQuizzes
};
//Role=0 coordinator accept
//Add subject,Delete,Edit
//Department
//Teacher Delete
//Quiz
//Question list only
//Student List
