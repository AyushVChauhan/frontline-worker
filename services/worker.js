const workers = require("../models/workers");
const district = require("../models/districts");
const modules = require("../models/modules");
const subjects = require("../models/subjects");
const topics = require("../models/topics");
const sessions = require("../models/sessions");
const quizzes = require("../models/quizzes");
const ratings = require("../models/ratings");
const { default: mongoose } = require("mongoose");
const certificates = require("../models/certificates");
const comments = require("../models/comments");
const reminders = require("../models/reminders");
const puppeteer = require("puppeteer")

// Authenticate a worker user based on their username and password
// Input: username (the username of the worker), password (the password of the worker)
// Output: A result representing the authenticated worker, or null if authentication fails
async function workerLogin(username, password) {
    let result = await workers.findOne({
        username: username,
        password: password,
    });
    return result;
}

// Retrieve worker information based on their username
// Input: username (the username of the worker)
// Output: A result representing the worker with the specified username, or null if not found
async function fetchWorker(username) {
    let result = await workers.findOne({ username: username });
    return result;
}

// Create a new worker user and save their information in the database
// Input: data (an object containing user information such as username, name, districtId, email, password, phone, dateOfBirth, aadharCard, photo)
// Output: An array of size 2 containing the user and user photo (time.extension)
async function workerSignup(data) {
    const worker = new workers({
        username: data.username,
        name: data.name,
        districtId: data.districtId,
        email: data.email,
        password: data.password,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        aadharCard: data.aadharCard,
        photo: data.photo,
        androidId: data.androidId,
        pushToken: data.pushToken,
    });
    worker.save();
    return [worker, worker._id];
}

async function workerPhoto(workerId, photo) {
    let worker = await workers.findOne({ _id: workerId });
    worker.faces.push(photo);
    await worker.save();
}

async function deleteWorkerPermanent(workerId) {
    let worker = await workers.deleteOne({ _id: workerId });
}

// Retrieve a list of active districts from the database
// Output: An array of district objects representing active districts
async function fetchDistrict() {
    let districts = await district.find({ is_active: 1 });
    return districts;
}

async function addMySubject(subjectId, workerId) {
    let worker = await workers.findOne({ _id: workerId });
    let bool = false;
    let today = new Date();
    worker.enrolledSubjects.forEach((ele) => {
        if (ele.endDate > today) {
            if (ele.subject.toString() != subjectId) {
                ele.endDate = today;
            } else {
                bool = true;
            }
            return;
        }
    });
    if (bool == false) {
        worker.enrolledSubjects.push({
            startDate: today,
            endDate: new Date(3023, 1, 1),
            subject: subjectId,
        });
        await worker.save();
    }
}

// Retrieve modules for a given subject and worker
// Input:
//   - subjectId: The ID of the subject for which modules are to be retrieved
//   - workerId: The ID of the worker for whom the modules are being fetched
// Output:
//   - An array containing two elements:
//     1. An array of modules for the specified subject sorted by order.
//     2. The worker document associated with the given workerId.
async function getModules(subjectId, workerId) {
    let module = await modules
        .find({ subjectId: subjectId })
        .sort({ order: 1 });
    let worker = await workers.findOne({ _id: workerId });
    return [module, worker];
}

// Retrieve active subjects
// Output: - An array of active subjects.
async function getSubjects(workerId) {
    let subject = await subjects.find({ is_active: 1 });
    let worker = await workers.findOne({ _id: workerId });
    let myArr = [];
    for (let index = 0; index < subject.length; index++) {
        let allTopics = [];
        const element = subject[index];
        let module = await modules.find({ subjectId: element._id });
        module.forEach((ele) => {
            allTopics.push(...ele.topics.toString().split(","));
        });
        // console.log(allTopics);
        let topicsCompleted = 0;
        worker.topicsCompleted.forEach((ele) => {
            if (allTopics.indexOf(ele.topic.toString()) != -1) {
                topicsCompleted++;
            }
        });
        let certificate = await certificates.find({
            workerId: worker._id,
            subjectId: element,
        });
        myArr.push({
            _id: element._id,
            name: element.name,
            completion: topicsCompleted / allTopics.length,
            certificates: certificate.length,
        });
    }
    return myArr;
}

// Retrieve topics for a specific module
// Input:
//   - moduleId: ID of the module for which topics are being retrieved.
//   - workerId: ID of the worker for whom topics are being retrieved.
// Output:
//   - An array of topics for the specified module.
//   - Worker information for the given worker ID.
async function getTopics(moduleId, workerId) {
    let topic = await topics.find({ moduleId: moduleId }).sort({ order: 1 });
    let worker = await workers.findOne({ _id: workerId });
    return [topic, worker];
}

// Retrieve upcoming training quizzes for a specific subject
// Input:
//   - subjectId: ID of the subject for which upcoming training quizzes are being retrieved.
// Output:
//   - An array of upcoming training quizzes for the specified subject.
async function upcomingQuiz(subjectId) {
    let today = new Date();
    let quiz = await quizzes.find({
        subjectId: subjectId,
        type: 2,
        is_active: 1,
        visible_from: { $lt: today },
        valid_from: { $gt: today },
    });
    return quiz;
}

// Retrieve the profile information of a worker based on their ID
// Input:
//   - myId: ID of the worker for which the profile information is being retrieved.
// Output:
//   - Worker profile information, including details about the worker and their associated district.
async function getProfile(myId) {
    let worker = await workers.findOne({ _id: myId }).populate("districtId");
    return worker;
}

// Add or remove a topic from a worker's bookmarks list
// Input:
//   - topicId: ID of the topic being bookmarked or unbookmarked.
//   - myId: ID of the worker performing the bookmark action.
// Output: (Updates the worker's bookmarked topics in the database)
async function bookmarkTopic(topicId, myId) {
    let worker = await workers.findOne({ _id: myId });
    let flag = 1;
    for (let index = 0; index < worker.topicsBookmarked.length; index++) {
        const element = worker.topicsBookmarked[index];
        if (element.topic.toString() == topicId) {
            worker.topicsBookmarked.splice(index, 1);
            flag = 0;
            break;
        }
    }
    if (flag) {
        worker.topicsBookmarked.push({
            topic: new mongoose.Types.ObjectId(topicId),
            dateOfBookmark: new Date(),
        });
    }
    await worker.save();
}

// Mark a topic as completed by a worker
// Input:
//   - topicId: ID of the topic being marked as completed.
//   - myId: ID of the worker completing the topic.
// Output: (Updates the worker's completed topics in the database)
async function completeTopic(topicId, myId) {
    let worker = await workers.findOne({ _id: myId });
    let flag = worker.topicsCompleted.some(
        (ele) => ele.topic.toString() == topicId
    );
    if (!flag) {
        worker.topicsCompleted.push({
            topic: new mongoose.Types.ObjectId(topicId),
            dateOfCompletion: new Date(),
        });
        await worker.save();
        sendPracticeReminder(topicId, worker);
        sendTrainingReminder(topicId, worker);
    }
}

async function sendTrainingReminder(topicId, worker) {
    let topic = await topics
        .findOne({ _id: topicId }, { moduleId: 1 })
        .populate({ path: "moduleId", select: { subjectId: 1 } });
    let subjectId = topic.moduleId.subjectId;
    let module = await modules.find({ subjectId }).lean();
    let allTopics = [];
    module.forEach((ele) => {
        allTopics.push(...ele.topics.flat(1));
    });
    var flag = 0;
    allTopics.forEach((element) => {
        if (
            worker.topicsCompleted.some(
                (ele) => ele.topic.toString() == element.toString()
            )
        ) {
            flag++;
        }
    });
    if (flag == allTopics.length) {
        setReminder(
            new Date(),
            "Your Subject is Completed, It is recommended to give Training test",
            "Training Test Time!!",
            worker._id
        );
    }
}

async function sendPracticeReminder(topicId, worker) {
    let topic = await topics
        .findOne({ _id: topicId }, { moduleId: 1 })
        .populate({ path: "moduleId", select: { topics: 1 } });
    var flag2 = 0;
    topic.moduleId.topics.forEach((element) => {
        if (
            worker.topicsCompleted.some(
                (ele) => ele.topic.toString() == element.toString()
            )
        )
            flag2++;
    });
    if (flag2 == topic.moduleId.topics.length) {
        setReminder(
            new Date(),
            "Your Module is Completed, It is recommended to give practice test",
            "Practice Test Time!!",
            worker._id
        );
    }
}

// Get a list of available quizzes for a worker
// Input:
//   - myId: ID of the worker for whom available quizzes are retrieved.
// Output:
//   - An array of available quiz objects that the worker can access.
async function availableQuiz(myId) {
    let today = new Date();
    let quiz = await quizzes.find({
        type: 2,
        valid_from: { $lt: today },
        valid_to: { $gt: today },
        is_active: 1,
    });
    let quizIds = [];
    quiz.forEach((ele) => {
        quizIds.push(ele._id);
    });
    let session = await sessions.find({
        workerId: myId,
        quizId: { $in: quizIds },
        end_time: { $lt: today },
    });
    let myQuizzes = [];
    for (let index = 0; index < quiz.length; index++) {
        const ele = quiz[index];

        let flag = 0;
        session.forEach((session) => {
            if (session.quizId.toString() == ele._id.toString()) {
                flag = 1;
                return;
            }
        });
        if (flag == 0) {
            myQuizzes.push(ele);
        }
    }
    return myQuizzes;
}

async function generalQuiz() {
    let today = new Date();
    let quiz = await quizzes.find({
        type: 3,
        valid_from: { $lt: today },
        valid_to: { $gt: today },
        is_active: 1,
    });
    return quiz;
}

// Function to check if a worker can take a quiz and create a session if allowed
// Input:
//   - myId: ID of the worker taking the quiz.
//   - quizId: ID of the quiz being taken.
// Output:
//   - 1: If the worker can take the quiz and a session was created or exists.
//   - 0: If the worker doesn't have permission to take the quiz or session creation failed.
async function takeQuiz(myId, quizId) {
    let today = new Date();
    let quiz = await quizzes.findOne({ _id: quizId });
    let session = null;
    if (quiz.type == 2) {
        session = await sessions.findOne({
            workerId: myId,
            quizId: quizId,
        });
        if (session) {
            if (session.end_time > today) {
                // return "Permission granted dot create session"
                return 1;
            } else {
                return 0;
                // return "Permission denied, failed"
            }
        } else {
            await createSession(myId, quizId);
            return 1;
            // return "Create Session"
        }
    } else {
        session = await sessions.findOne({
            workerId: myId,
            quizId: quizId,
            end_time: { $gt: today },
        });
        if (session) {
            // return "session exists";
            return 1;
        } else {
            await createSession(myId, quizId);
            return 1;
            // return "create session";
        }
    }
    // let quiz = await quizzes.findOne({ _id: quizId });
    // if (session) {
    // let workerDuration = (today - new Date(session.start_time)) / 60000;
    // if (session.end_time) {
    //     return false;
    // } else if (workerDuration > quiz.duration) {
    //     return false;
    // }
    // if(session.end_time < today)
    // {
    //     //quiz expired
    //     return false;
    // }
    // else {
    // }
    //session already exists
    // }
    // return true;
}

// Function to create a session for a worker to take a quiz
// Input:
//   - myId: ID of the worker for whom the session is created.
//   - quizId: ID of the quiz for which the session is being created.
// The function generates a session with randomized quiz questions based on the quiz's configuration.
async function createSession(myId, quizId) {
    let quiz = await quizzes.findOne({ _id: quizId });
    let selectedQuestions = [];
    quiz.marks_questions.forEach((ele) => {
        let flag = 0;
        quiz.compulsary_questions.forEach((compQues) => {
            if (compQues.marks == ele.marks) {
                flag++;
                selectedQuestions.push({
                    question: compQues.question,
                    answer: "",
                    marks: 0,
                    time_spent: 0,
                });
            }
        });
        let random_questions = [];
        if (flag < ele.count) {
            quiz.random_questions.forEach((randQues) => {
                if (randQues.marks == ele.marks) {
                    random_questions.push({
                        question: randQues.question,
                        answer: "",
                        marks: 0,
                        time_spent: 0,
                    });
                }
            });
            for (let index = 0; index < ele.count - flag; index++) {
                let temp = Math.floor(Math.random() * random_questions.length);
                selectedQuestions.push(random_questions[temp]);
                random_questions.splice(temp, 1);
            }
        }
    });
    let i = selectedQuestions.length;
    let randomIndex = 0;
    while (i != 0) {
        randomIndex = Math.floor(Math.random() * i);
        i--;
        [selectedQuestions[i], selectedQuestions[randomIndex]] = [
            selectedQuestions[randomIndex],
            selectedQuestions[i],
        ];
    }
    let session = new sessions({
        quizId: quizId,
        is_active: 1,
        workerId: myId,
        start_time: new Date(),
        end_time: new Date(Date.now() + quiz.duration * 60000),
        status: 0,
        questions_answers: selectedQuestions,
    });
    await session.save();
}

// Function to retrieve a session for a worker to take a quiz
// Input:
//   - quizId: ID of the quiz for which the session is being retrieved.
//   - myId: ID of the worker for whom the session is retrieved.
// The function retrieves the active session for the specified worker and quiz,
// populates it with associated question and quiz data, and returns the session details.
async function getSession(quizId, myId) {
    let today = new Date();
    let mySession = await sessions
        .findOne({ workerId: myId, quizId: quizId, end_time: { $gt: today } })
        .populate("questions_answers.question")
        .populate("quizId");
    // let spentTimeMinutes = (new Date(mySession.start_time) - today)/60000;
    // let duration = mySession.quizId.duration - spentTimeMinutes;
    // let remainingTimeMinutes = (new Date(mySession.quizId.valid_to) - today)/60000;
    // if(duration > remainingTimeMinutes)
    // {
    //     duration = remainingTimeMinutes;
    // }
    return mySession;
}

// Function to submit a quiz with answers and end time
// Input:
//   - myId: ID of the worker submitting the quiz.
//   - questions_answers: Array of answers submitted by the worker for each question.
//   - quizId: ID of the quiz being submitted.
//   - end_time: The end time when the quiz was submitted.
// The function finds the active session for the worker and specified quiz,
// updates the session with submitted answers, end time, and sets the status to completed.
// If the quiz type is training (type 1), it triggers the process to provide a training certificate to the worker.
// Returns 1 if the submission was successful, or 0 if the session is not found.
async function submitQuiz(myId, questions_answers, quizId, end_time) {
    let today = new Date();
    // console.log(myId, quizId, questions_answers);
    let mySession = await sessions
        .findOne({
            workerId: myId,
            quizId: quizId,
            end_time: { $gt: today },
        })
        .populate("quizId");
    if (mySession) {
        mySession.questions_answers = questions_answers;
        mySession.end_time = end_time;
        if (mySession.status != 2) {
            mySession.status = 1;
        }
        await mySession.save();
        if (mySession.quizId.type == 1) {
            giveTrainingCertificateToWorker(mySession._id);
        }
        return 1;
    }
    return 0;
}

// Function to evaluate a worker's performance in a training quiz and issue a training certificate if passed
// Input:
//   - sessionId: The ID of the session for the quiz to be evaluated.
// The function retrieves the session, evaluates the worker's performance based on quiz answers,
//              and issues a training certificate if the worker's score is higher than 22.
// The certificate is then associated with the worker, and the session is marked as evaluated (is_evaluated = 1) for tracking.
async function giveTrainingCertificateToWorker(sessionId) {
    let mySession = await sessions
        .findOne({ _id: sessionId })
        .populate({
            path: "questions_answers.question",
            select: { question: 0 },
        })
        .populate({path:"quizId", populate:{path:"subjectId"}});
    let myMarks = 0;
    mySession.questions_answers.forEach((question) => {
        if (question.question.caseSensitive == 1) {
            if (question.question.answer == question.answer) {
                myMarks += 1;
            }
        } else {
            if (
                question.question.answer.toUpperCase() ==
                question.answer.toUpperCase()
            ) {
                myMarks += 1;
            }
        }
    });
    if (myMarks > 22) {
        mySession.is_evaluated = 1;
        await mySession.save();
        let certificate = new certificates({
            sessionId: mySession._id,
            subjectId: mySession.quizId.subjectId._id,
            type: 0,
            workerId: mySession.workerId,
        });
        await certificate.save();
        let worker = await workers.findOne({ _id: mySession.workerId });
        worker.certificates.push({
            certificateType: 0,
            certificate: certificate._id,
        });
        await worker.save();
        generateCertificatePdf(certificate,worker.name,mySession.quizId.subjectId.name)
    } else {
        mySession.is_evaluated = -1;
        await mySession.save();
    }
}
async function generateCertificatePdf(certificate, workerName, subjectName) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    let website_url = null;
    let date = new Date(certificate.createdAt).getTime();

    // Determine the URL for the certificate template based on the certificate type
    if (certificate.type == 0) {
        website_url = `http://localhost:3000/worker/putDataInCertificate?name=${workerName}&subject=${subjectName}&date=${date}&type=0&certificateId=${certificate._id}`;
    } else {
        website_url = `http://localhost:3000/worker/putDataInCertificate?name=${workerName}&subject=${subjectName}&date=${date}&type=1&certificateId=${certificate._id}`;
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
// Function to retrieve the practice quiz ID associated with a specific module
// Input:
//   - moduleId: The ID of the module for which the practice quiz is to be retrieved.
// The function queries the database to find the practice quiz associated with the specified module and returns its ID.
async function getPracticeQuiz(moduleId) {
    let quiz = await quizzes.findOne({ moduleId: moduleId, type: 0 });
    if (quiz.random_questions.length >= 10) {
        return quiz;
    } else {
        return 0;
    }
}

// Function to retrieve the training quiz ID associated with a specific subject
// Input:
//   - subjectId: The ID of the subject for which the training quiz is to be retrieved.
// The function queries the database to find the training quiz associated with the specified subject and returns its ID.
async function getTrainingQuiz(subjectId) {
    let quiz = await quizzes.findOne({ subjectId: subjectId, type: 1 });
    if (quiz.random_questions.length >= 30) {
        return quiz;
    } else {
        return 0;
    }
    return quiz;
}

// Does both final and training
// Function to retrieve training certificates for a worker based on certificate type
// Input:
//   - myId: The ID of the worker for whom training certificates are to be retrieved.
//   - num: Certificate type (0 for training certificates, 1 for final certificates)
// The function queries the database to find training certificates of the specified type for the given worker.
// It returns an array of certificates with additional subject information.
async function trainingCertificate(myId, num) {
    let certificate = await certificates
        .find({ type: num, workerId: myId })
        .populate("subjectId");
    return certificate;
}

// Function to retrieve a worker's quiz history based on quiz type
// Input:
//   - type: Type of quiz (0 for practice, 1 for training, 2 for final)
//   - myId: The ID of the worker for whom quiz history is to be retrieved.
// The function queries the database to find quiz sessions of the specified type for the given worker.
// It calculates the marks obtained and total marks for each session, and returns an array of filtered quiz sessions.
async function history(type, myId) {
    let mySessions = await sessions
        .find({ workerId: myId })
        .populate({
            path: "quizId",
            match: { type: type },
            populate: { path: "subjectId", model: "subjects" },
        })
        .populate({
            path: "questions_answers.question",
            populate: {
                path: "topicId",
                model: "topics",
                select: { content: 0 },
                populate: { path: "moduleId", model: "modules" },
            },
        })
        .sort({ end_time: -1 });
    let filteredSessions = [];
    mySessions.forEach((ele) => {
        if (ele.quizId) {
            let marksObtained = 0;
            let totalMarks = 0;
            ele.questions_answers.forEach((obj) => {
                if (type <= 1) {
                    totalMarks++;
                } else {
                    totalMarks += obj.question.marks;
                }

                if (obj.question.caseSensitive == 1) {
                    if (obj.question.answer == obj.answer) {
                        if (type <= 1) {
                            marksObtained++;
                        } else {
                            marksObtained += obj.question.marks;
                        }
                    }
                } else {
                    if (
                        obj.question.answer.toUpperCase() ==
                        obj.answer.toUpperCase()
                    ) {
                        if (type <= 1) {
                            marksObtained++;
                        } else {
                            marksObtained += obj.question.marks;
                        }
                    }
                }
            });
            filteredSessions.push({
                _id: ele._id,
                name: ele.quizId.name,
                subject: ele.quizId.subjectId?.name,
                marksObtained,
                totalMarks,
                completedAt: ele.end_time,
                status: ele.status,
                certificateStatus: ele.is_evaluated,
                valid_to: ele.quizId.valid_to,
                // questions_answers: ele.questions_answers,
            });
        }
    });
    return filteredSessions;
}

// Function to retrieve details of a specific quiz session based on session ID
// Input:
//   - sessionId: The ID of the session for which quiz history is to be retrieved.
// The function queries the database to find a specific quiz session by its ID.
// It populates related data, calculates marks obtained and total marks, and returns the session information.
async function getQuizHistory(sessionId) {
    let ele = await sessions
        .findOne({ _id: sessionId })
        .populate({
            path: "quizId",
            populate: { path: "subjectId", model: "subjects" },
        })
        .populate({
            path: "questions_answers.question",
            populate: {
                path: "topicId",
                model: "topics",
                select: { content: 0 },
                populate: { path: "moduleId", model: "modules" },
            },
        })
        .sort({ end_time: -1 });
    let filteredSessions = {};

    let marksObtained = 0;
    let totalMarks = 0;
    let type = ele.quizId.type;
    ele.questions_answers.forEach((obj) => {
        if (type <= 1) {
            totalMarks++;
        } else {
            totalMarks += obj.question.marks;
        }
        if (obj.question.caseSensitive == 1) {
            if (obj.question.answer == obj.answer) {
                if (type <= 1) {
                    marksObtained++;
                } else {
                    marksObtained += obj.question.marks;
                }
            }
        } else {
            if (obj.question.answer.toUpperCase() == obj.answer.toUpperCase()) {
                if (type <= 1) {
                    marksObtained++;
                } else {
                    marksObtained += obj.question.marks;
                }
            }
        }
    });
    filteredSessions = {
        _id: ele._id,
        name: ele.quizId.name,
        subject: ele.quizId.subjectId?.name,
        marksObtained,
        totalMarks,
        completedAt: ele.end_time,
        status: ele.status,
        certificateStatus: ele.is_evaluated,
        questions_answers: ele.questions_answers,
        quizId: ele.quizId._id,
    };

    return filteredSessions;
}

// Function to check the existence of a certificate by its ID
// Input:
//   - certificateId: The ID of the certificate to be checked.
// The function queries the database to find a certificate by its ID.
// It populates related worker and subject data and returns the certificate information if found.
// If the certificate does not exist, it returns false.
async function checkCertificate(certificateId) {
    // console.log(certificateId);
    let certi = await certificates
        .findOne({ _id: certificateId })
        .populate("workerId")
        .populate("subjectId");
    if (certi) {
        return certi;
    }
    return false;
}

// Function to retrieve bookmarked topics for a worker in a specific subject
// Input:
//   - myId: The ID of the worker for whom bookmarks are retrieved.
//   - subjectId: The ID of the subject for which bookmarks are retrieved.
// The function fetches the worker's bookmarks from the database, filtering them by the specified subject.
// It organizes the bookmarks by modules and topics and returns the bookmarked modules and their associated topics as a structured data format.
async function getBookmarks(myId, subjectId) {
    let worker = await workers.findOne({ _id: myId }).populate({
        path: "topicsBookmarked.topic",
        select: { content: 0 },
        populate: { path: "moduleId", match: { subjectId: subjectId } },
    });
    let filteredModules = new Map();
    worker.topicsBookmarked.forEach((topic) => {
        if (topic.topic.moduleId) {
            if (filteredModules.get(topic.topic.moduleId._id.toString())) {
                let oldTopics = filteredModules.get(
                    topic.topic.moduleId._id.toString()
                );
                oldTopics.topics.push({
                    topic: topic.topic.topic,
                    topicId: topic.topic._id,
                });
                filteredModules.set(
                    topic.topic.moduleId._id.toString(),
                    oldTopics
                );
            } else {
                filteredModules.set(topic.topic.moduleId._id.toString(), {
                    moduleName: topic.topic.moduleId.moduleName,
                    moduleId: topic.topic.moduleId._id.toString(),
                    topics: [
                        { topic: topic.topic.topic, topicId: topic.topic._id },
                    ],
                });
            }
        }
    });
    console.log(filteredModules);
    return Array.from(filteredModules);
    // console.log(JSON.stringify(worker.topicsBookmarked));
}

// Function to perform an analysis on a worker's quiz session and calculate various metrics
// Input:
//   - sessionId: The ID of the quiz session to analyze.
// The function retrieves the specified quiz session and associated data, including questions, topics, modules, and certificates.
// It then calculates multiple metrics related to the worker's performance in the quiz session,
//                    such as module-wise marks, difficulty-based marks, time-based difficulty, and time spent on modules.
// The calculated metrics are returned as an array.
async function analysis(sessionId) {
    let worker = await sessions
        .findOne({ _id: sessionId })
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
            populate: { path: "certificates", model: "certificates" },
        })
        .populate("quizId");
    let moduleMarksa = await moduleMarks(worker, worker.quizId.subjectId);
    let difficultyMarksa = await difficultyMarks(worker);
    let timeDifficultya = await timeDifficulty(worker);
    let timeModulesa = await timeModules(worker, worker.quizId.subjectId);
    return [moduleMarksa, difficultyMarksa, timeDifficultya, timeModulesa];
}

async function generalAnalysis(sessionId) {
    let worker = await sessions
        .findOne({ _id: sessionId })
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
            populate: { path: "certificates", model: "certificates" },
        })
        .populate("quizId");
    let difficultyMarksa = await difficultyMarks(worker);
    let timeDifficultya = await timeDifficulty(worker);
    let subjectMarksa = await subjectMarks(worker);
    let subjectTimea = await subjectTime(worker);
    return [difficultyMarksa, timeDifficultya, subjectMarksa, subjectTimea];
}

async function subjectMarks(worker) {
    let subject = await subjects.find({});
    let myMap = new Map();
    subject.forEach((ele) => {
        myMap.set(ele._id.toString(), {
            name: ele.name,
            totalMarks: 0,
            marksObtained: 0,
        });
    });
    worker.questions_answers.forEach((question) => {
        let subjectIdofThisQuestion =
            question.question.topicId[0].moduleId.subjectId;
        let marks = 0;
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

        let myModuleObject = myMap.get(subjectIdofThisQuestion.toString());
        myModuleObject.totalMarks += markOfThisQuestion;
        myModuleObject.marksObtained += marks;
        myMap.set(subjectIdofThisQuestion.toString(), myModuleObject);
    });
    let myArr = Array.from(myMap);
    let result = myArr.filter((ele) => ele[1].totalMarks > 0);
    return result;
}

async function subjectTime(worker) {
    let subject = await subjects.find({});
    let myMap = new Map();
    subject.forEach((ele) => {
        myMap.set(ele._id.toString(), {
            name: ele.name,
            timeSpent: 0,
            timeRequired: 0,
        });
    });
    worker.questions_answers.forEach((question) => {
        let subjectIdofThisQuestion =
            question.question.topicId[0].moduleId.subjectId;
        let myModuleObject = myMap.get(subjectIdofThisQuestion.toString());
        myModuleObject.timeSpent += question.time_spent;
        myModuleObject.timeRequired += question.question.time_required;
        myMap.set(subjectIdofThisQuestion.toString(), myModuleObject);
    });

    let myArr = Array.from(myMap);
    let result = myArr.filter((ele) => ele[1].timeRequired > 0);
    return result;
}

// Function to calculate module-wise marks for a worker's quiz session
// Input:
//   - worker: The worker's quiz session data, including questions and answers.
//   - subjectId: The ID of the subject associated with the quiz session.
// The function calculates the marks obtained by the worker for each module within the specified subject.
// It returns an array of module-wise marks, including the module name, total marks, and marks obtained.
async function moduleMarks(worker, subjectId) {
    let module = await modules.find({ subjectId: subjectId });
    let myMap = new Map();
    module.forEach((ele) => {
        myMap.set(ele._id.toString(), {
            moduleName: ele.moduleName,
            totalMarks: 0,
            marksObtained: 0,
        });
    });

    worker.questions_answers.forEach((question) => {
        let moduleIdofThisQuestion = question.question.topicId[0].moduleId._id;
        let marks = 0;
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
        myModuleObject.totalMarks += markOfThisQuestion;
        myModuleObject.marksObtained += marks;
        myMap.set(moduleIdofThisQuestion.toString(), myModuleObject);
    });

    return Array.from(myMap);
}

// Function to calculate marks based on question difficulty for a worker's quiz session
// Input:
//   - worker: The worker's quiz session data, including questions and answers.
// The function calculates the marks obtained by the worker for questions of different difficulty levels.
// It returns an array containing difficulty-wise marks, including difficulty level (Easy, Medium, Hard), total marks, and marks obtained.
async function difficultyMarks(worker) {
    let myArr = [
        { difficulty: "Easy", totalMarks: 0, marksObtained: 0 },
        { difficulty: "Medium", totalMarks: 0, marksObtained: 0 },
        { difficulty: "Hard", totalMarks: 0, marksObtained: 0 },
    ];

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
                question.question.answer.toUpperCase() ==
                question.answer.toUpperCase()
            ) {
                marks = markOfThisQuestion;
            }
        }
        myArr[difficultyOfThisQuestion - 1].totalMarks += markOfThisQuestion;
        myArr[difficultyOfThisQuestion - 1].marksObtained += marks;
    });

    // console.log(myArr);
    return myArr;
}

// Function to calculate time spent and time required for questions of different difficulty levels in a worker's quiz session
// Input:
//   - worker: The worker's quiz session data, including questions, answers, and time spent.
// The function calculates the time spent and time required for questions of different difficulty levels (Easy, Medium, Hard).
// It returns an array containing difficulty-wise time spent and time required.
async function timeDifficulty(worker) {
    let myArr = [
        { difficulty: "Easy", timeSpent: 0, timeRequired: 0 },
        { difficulty: "Medium", timeSpent: 0, timeRequired: 0 },
        { difficulty: "Hard", timeSpent: 0, timeRequired: 0 },
    ];

    worker.questions_answers.forEach((question) => {
        let difficultyOfThisQuestion = question.question.difficulty;
        myArr[difficultyOfThisQuestion - 1].timeSpent += question.time_spent;
        myArr[difficultyOfThisQuestion - 1].timeRequired +=
            question.question.time_required;
    });

    // console.log(myArr);
    return myArr;
}

// Function to calculate time spent and time required for modules within a subject in a worker's quiz session
// Input:
//   - worker: The worker's quiz session data, including questions, answers, and time spent.
//   - subjectId: The ID of the subject to which the modules belong.
// The function calculates the time spent and time required for each module within the specified subject.
// It returns an array containing module-wise time spent and time required.
async function timeModules(worker, subjectId) {
    let module = await modules.find({ subjectId: subjectId });
    let myMap = new Map();
    module.forEach((ele) => {
        myMap.set(ele._id.toString(), {
            moduleName: ele.moduleName,
            timeSpent: 0,
            timeRequired: 0,
        });
    });

    worker.questions_answers.forEach((question) => {
        let moduleIdofThisQuestion = question.question.topicId[0].moduleId._id;
        let myModuleObject = myMap.get(moduleIdofThisQuestion.toString());
        myModuleObject.timeSpent += question.time_spent;
        myModuleObject.timeRequired += question.question.time_required;
        myMap.set(moduleIdofThisQuestion.toString(), myModuleObject);
    });

    return Array.from(myMap);
}

async function getWorkerPhotos(workerId) {
    let worker = await workers.findOne({ _id: workerId });
    if (worker) {
        return worker.faces;
    } else {
        return -1;
    }
}

async function disqualifyPhoto(workerId, quizId, photo, reason) {
    let today = new Date();
    let mySession = await sessions
        .findOne({
            workerId: workerId,
            quizId: quizId,
            end_time: { $gt: today },
        })
        .populate("quizId");
    mySession.status = 2;
    mySession.remarks.push({ file: photo, reason });
    await mySession.save();
}

async function leaderboard(quizId) {
    let worker = await sessions
        .find({ quizId: quizId, status: 1 })
        .populate({
            path: "questions_answers.question",
            select: { question: 0 },
        })
        .populate({
            path: "workerId",
        });
    // console.log(worker);
    let myMap = new Map();
    worker.forEach((session) => {
        let marks = 0;
        let timeSpent = 0;
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
                    });
                } else if (marks > oldObj.marksObtained) {
                    myMap.set(session.workerId._id.toString(), {
                        username: session.workerId.username,
                        marksObtained: marks,
                        timeSpent,
                        date: session.end_time,
                    });
                }
            }
        } else {
            myMap.set(session.workerId._id.toString(), {
                username: session.workerId.username,
                marksObtained: marks,
                timeSpent,
                date: session.end_time,
            });
        }
    });
    let myArr = Array.from(myMap);
    myArr.sort(function (a, b) {
        if (a[1].marksObtained > b[1].marksObtained) {
            return -1;
        } else if (a[1].marksObtained == b[1].marksObtained) {
            if (a[1].timeSpent < b[1].timeSpent) {
                return -1;
            } else if (a[1].timeSpent > b[1].timeSpent) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return 1;
        }
    });
    return myArr;
}

async function performance(workerId, subjectId, type, moduleId) {
    let quizId = null;
    if (subjectId) {
        quizId = await quizzes.findOne({ subjectId, type }, { _id: 1 });
    } else {
        quizId = await quizzes.findOne({ moduleId, type }, { _id: 1 });
    }
    let worker = await sessions
        .find({ quizId: quizId._id, workerId })
        .populate({
            path: "questions_answers.question",
            select: { question: 0 },
        })
        .sort({ end_time: -1 });
    let myArr = [];
    console.log(worker);
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
    return myArr.reverse();
}

async function moduleRating(workerId, moduleId, feedback, ratingStar) {
    let rating = await ratings.findOne({ workerId, moduleId });
    let count = await ratings.count({ moduleId });
    let module = await modules.findOne({ _id: moduleId });
    ratingStar = parseInt(ratingStar);
    if (rating) {
        let oldrating = rating.rating;
        let moduleRating = module.rating;

        moduleRating = (moduleRating * count - oldrating + ratingStar) / count;

        module.rating = moduleRating;
        await module.save();
        rating.rating = ratingStar;
        rating.feedback = feedback;
        await rating.save();
    } else {
        let newRating = new ratings({
            workerId,
            moduleId,
            feedback,
            rating: ratingStar,
        });
        let moduleRating = module.rating;
        moduleRating = (moduleRating * count + ratingStar) / (count + 1);
        module.rating = moduleRating;
        await module.save();
        await newRating.save();
    }
}

async function radialPerformance(workerId, subjectId) {
    let module = await modules.find({ subjectId });
    let myMap = [];
    for (let index = 0; index < module.length; index++) {
        const element = module[index];
        let quiz = await quizzes.findOne({ moduleId: element._id, type: 0 });
        let session = await sessions
            .find({ quizId: quiz._id, workerId, status: 1 })
            .populate({
                path: "questions_answers.question",
                select: { question: 0 },
            });
        let myArr = 0;
        for (let index = 0; index < session.length; index++) {
            const element2 = session[index];
            let myObj = calculateMarks(element2);
            myObj = ((myObj.marks / myObj.totalMarks) * 100).toFixed(2);
            if (myArr < myObj) {
                myArr = myObj;
            }
        }
        myMap.push({ module: element.moduleName, performance: myArr });
    }
    return myMap;
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

async function addComment(workerId, topicId, content) {
    let comment = new comments({
        workerId,
        replies: [],
        content,
        topicId,
        is_active: 1,
        is_reply: 0,
    });
    await comment.save();
}

async function addReply(workerId, topicId, commentId, content) {
    let comment = new comments({
        workerId,
        content,
        topicId,
        is_active: 1,
        is_reply: 1,
    });
    await comment.save();
    let replyTo = await comments
        .findOne({ _id: commentId })
        .populate("topicId");
    setReminder(
        new Date(),
        `Someone replied to your comment in ${replyTo.topicId.topic} topic`,
        "Comment Reply",
        [replyTo.workerId]
    );

    replyTo.replies.push(comment._id);
    await replyTo.save();
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

module.exports = {
    workerLogin,
    workerSignup,
    fetchDistrict,
    fetchWorker,
    getModules,
    getSubjects,
    getTopics,
    upcomingQuiz,
    getProfile,
    bookmarkTopic,
    completeTopic,
    availableQuiz,
    takeQuiz,
    getSession,
    createSession,
    submitQuiz,
    getPracticeQuiz,
    trainingCertificate,
    giveTrainingCertificateToWorker,
    getTrainingQuiz,
    history,
    checkCertificate,
    getQuizHistory,
    getBookmarks,
    analysis,
    workerPhoto,
    getWorkerPhotos,
    disqualifyPhoto,
    generalQuiz,
    generalAnalysis,
    leaderboard,
    performance,
    moduleRating,
    deleteWorkerPermanent,
    addMySubject,
    radialPerformance,
    addComment,
    addReply,
    getComments,
};
