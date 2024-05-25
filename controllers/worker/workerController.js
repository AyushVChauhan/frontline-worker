const workers = require("../../models/workers");
const workerServices = require("../../services/worker");
const { default: mongoose } = require("mongoose");
const jwt = require("jsonwebtoken");
const puppeteer = require("puppeteer");
const { loadImage } = require("canvas");
const faceapi = require("../faceController");
const { JWT_SECRET } = process.env;
const fs = require("fs");
const ratings = require("../../models/ratings");

// Handle the worker signup process, including user registration and token generation
// Input: req (request object containing user data), res (response object)
// Output: JSON response indicating the success of the signup, user information, and a token
async function workerSignup(req, res) {
    let data = JSON.parse(req.body.data);
    // console.log(data);

    // to check whether usre exists or not
    let result = await workerServices.fetchWorker(data.username);
    if (result) {
        fs.rm(req.file.path, () => {});
        return res.json({ message: "User Already Registered", success: 0 });
    }
    data.photo = req.file.filename;
    //for sigup process -> return array size 2 which contains the user and user photo(time.extention)
    let user = await workerServices.workerSignup(data);
    // after sigup process give user a token
    let token = jwt.sign({ user: user[0] }, process.env.JWT_SECRET);

    if (user) {
        res.json({
            message: "Register Successfully",
            success: 1,
            user: user[1],
            token,
        });
    } else {
        res.json({ message: "Register Failed", success: 0 });
    }
}

async function workerPhoto(req, res) {
    let workerId = req.query.workerId;
    let file = req.file.filename;
    let photos = await workerServices.getWorkerPhotos(workerId);
    if (photos != -1) {
        //check 1 face detection
        const myImage = await loadImage(req.file.path);
        let myFace = await faceapi
            .detectSingleFace(myImage)
            .withFaceLandmarks()
            .withFaceDescriptor();
        if (!myFace) {
            fs.rm(req.file.path, () => {});
            photos.forEach((ele) => {
                fs.rm("./public/files/workers/" + ele, () => {});
            });
            workerServices.deleteWorkerPermanent(workerId);
            res.json({ success: 0 });
            return;
        }
        //face is found check with other faces
        const images = await Promise.all(
            photos.map((ele) => loadImage("./public/files/workers/" + ele))
        );
        let detections = [];
        for (let index = 0; index < images.length; index++) {
            const element = images[index];
            detections.push(
                await faceapi
                    .detectSingleFace(element)
                    .withFaceLandmarks()
                    .withFaceDescriptor()
            );
        }
        const newDescriptor = myFace.descriptor;
        const distances = detections.map((descriptor) =>
            faceapi.euclideanDistance(descriptor.descriptor, newDescriptor)
        );
        const threshold = 0.4;
        let isMatch = true;
        console.log(distances);
        distances.forEach((ele) => {
            if (ele > threshold) {
                isMatch = false;
                return;
            }
        });
        if (isMatch == false) {
            fs.rm(req.file.path, () => {});
            photos.forEach((ele) => {
                fs.rm("./public/files/workers/" + ele, () => {});
            });
            workerServices.deleteWorkerPermanent(workerId);

            res.json({ success: 0 });
            return;
        }
        await workerServices.workerPhoto(workerId, file);
        res.json({ success: 1 });
    } else {
        fs.rm(req.file.path, () => {});
        res.json({ success: 0 });
        return;
    }
}

// Handle the worker login process, including user authentication and token generation
// Input: req (request object containing username and password), res (response object)
// Output: JSON response with a token if login is successful, or an error message if login fails
async function workerLogin(req, res) {
    const { username, password, androidId, pushToken } = req.body;
    // console.log(username, password, androidId);
    let user = await workerServices.workerLogin(username, password);
    if (user != null) {
        // console.log(user.androidId, androidId);
        if (user.androidId == androidId || user.androidId == null) {
            user.androidId = androidId;
            user.pushToken = pushToken;
            user.save();
            let token = jwt.sign({ user }, process.env.JWT_SECRET);
            res.json({ token, message: "Login Successfully", success: 1 });
        } else {
            res.json({
                message: "Already Logged In On Another Device",
                success: 0,
            });
        }
    } else {
        res.json({ message: "Invalid Credentials!", success: 0 });
    }
}

async function workerLogout(req, res) {
    const { username, password } = req.query;
    let user = await workerServices.workerLogin(username, password);
    user.androidId = null;
    user.pushToken = null;
    await user.save();
    res.json({ success: 1 });
}

// Retrieve and send a list of districts to the client
// Input: req (request object), res (response object)
// Output: JSON response containing the list of districts
async function fetchDistrict(req, res) {
    let districts = await workerServices.fetchDistrict();
    res.json(districts);
}

async function addMySubject(req, res) {
    let subjectId = req.query.subjectId;
    let myId = jwt.verify(req.query.token, process.env.JWT_SECRET)["user"][
        "_id"
    ];
    await workerServices.addMySubject(subjectId, myId);
    res.json({ success: 1 });
}

// Retrieve information about modules for a specific subject and the worker's interaction with those modules
// Input: req (request object containing subjectId and token), res (response object)
// Output: JSON response with module information, completed topics, and worker interaction status
async function getModules(req, res) {
    let subjectId = req.query.subjectId;
    let myId = jwt.verify(req.query.token, process.env.JWT_SECRET)["user"][
        "_id"
    ];
    let data = await workerServices.getModules(subjectId, myId);
    let module = data[0];
    let worker = data[1];
    let myArray = [];
    module.forEach((module) => {
        let goodTopics = [];
        let flag1 = 0;
        let flag2 = 0;
        module.topics.forEach((id) => {
            let completedObject = { completed: 0, date: null };
            let bookmarkedObject = { bookmarked: 0, date: null };
            worker.topicsCompleted.forEach((ele) => {
                if (ele.topic.toString() == id.toString()) {
                    completedObject = {
                        completed: 1,
                        date: ele.dateOfCompletion,
                    };
                    flag1++;
                    return;
                }
            });
            worker.topicsBookmarked.forEach((ele) => {
                if (ele.topic.toString() == id.toString()) {
                    bookmarkedObject = {
                        bookmarked: 1,
                        date: ele.dateOfBookmark,
                    };
                    return;
                }
            });
            goodTopics.push({ topic: id, bookmarkedObject, completedObject });
            // console.log(goodTopics);
        });
        myArray.push({
            _id: module._id,
            completedTopics: flag1,
            moduleName: module.moduleName,
            order: module.order,
            subjectId: module.subjectId,
            topics: goodTopics,
            rating: module.rating,
        });
    });
    for (let index = 0; index < myArray.length; index++) {
        const element = myArray[index];
        let rating = await ratings.findOne({
            workerId: myId,
            moduleId: element._id,
        });
        if (rating) {
            element.ratingGiven = true;
        } else {
            element.ratingGiven = false;
        }
    }
    res.json({ success: 1, modules: myArray });
}

// Retrieve and send a list of subjects to the client
// Input: req (request object), res (response object)
// Output: JSON response containing the list of subjects
async function getSubjects(req, res) {
    let myId = jwt.verify(req.query.token, process.env.JWT_SECRET)["user"][
        "_id"
    ];
    let subjects = await workerServices.getSubjects(myId);
    res.json({ success: 1, subjects });
}

// Retrieve information about topics within a module and the worker's interaction with those topics
// Input: req (request object containing moduleId and token), res (response object)
// Output: JSON response with topic information, completion status, and bookmark status
async function getTopics(req, res) {
    let moduleId = req.query.moduleId;
    let myId = jwt.verify(req.query.token, process.env.JWT_SECRET)["user"][
        "_id"
    ];
    let [topic, worker] = await workerServices.getTopics(moduleId, myId);
    let myArr = [];
    topic.forEach((ele) => {
        let flag1 = 0;
        let flag2 = 0;
        if (
            worker.topicsCompleted.find(
                (element) => element.topic.toString() == ele._id.toString()
            )
        ) {
            flag1 = 1;
        }
        if (
            worker.topicsBookmarked.find(
                (element) => element.topic.toString() == ele._id.toString()
            )
        ) {
            flag2 = 1;
        }
        myArr.push({
            _id: ele._id,
            topic: ele.topic,
            order: ele.order,
            content: ele.content,
            links: ele.links,
            resources: ele.resources,
            moduleId,
            completed: flag1,
            bookmarked: flag2,
        });
    });
    res.json({ success: 1, topics: myArr });
}

// Retrieve and send a list of upcoming quizzes for a specific subject to the client
// Input: req (request object containing subjectId), res (response object)
// Output: JSON response containing the list of upcoming quizzes
async function upcomingQuiz(req, res) {
    let subjectId = req.query.subjectId;
    let quizzes = await workerServices.upcomingQuiz(subjectId);
    res.json({ success: 1, quizzes });
}

// Retrieve and send the profile information of the current user to the client
// Input: req (request object containing a token), res (response object)
// Output: JSON response with the user's profile information and a success status
async function profile(req, res) {
    let token = req.query.token;
    let myId = jwt.verify(token, process.env.JWT_SECRET)["user"]["_id"];
    let worker = await workerServices.getProfile(myId);
    res.json({ worker, success: 1 });
}

// Retrieve Bookmarked topics for the current user
// Input: req (request object containing topicId and token), res (response object)
// Output: JSON response with a success status
async function bookmarkTopic(req, res) {
    let topicId = req.query.topicId;
    let token = req.query.token;
    let myId = jwt.verify(token, process.env.JWT_SECRET)["user"]["_id"];
    await workerServices.bookmarkTopic(topicId, myId);
    res.json({ success: 1 });
}

// Retrieve Completed topics for the current user
// Input: req (request object containing topicId and token), res (response object)
// Output: JSON response with a success status
async function completeTopic(req, res) {
    let topicId = req.query.topicId;
    let token = req.query.token;
    let myId = jwt.verify(token, process.env.JWT_SECRET)["user"]["_id"];
    workerServices.completeTopic(topicId, myId);
    res.json({ success: 1 });
}

// Retrieve and send a list of available quizzes for the current user
// Input: req (request object containing a token), res (response object)
// Output: JSON response containing the list of available quizzes
async function availableQuiz(req, res) {
    let token = req.query.token;
    let myId = jwt.verify(token, process.env.JWT_SECRET)["user"]["_id"];
    let quizzes = await workerServices.availableQuiz(myId);
    res.json({ quizzes, success: 1 });
}

// Retrieve the practice quiz ID for a specific module and send it to the client
// Input: req (request object containing moduleId), res (response object)
// Output: JSON response with the practice quiz ID and a success status
async function practiceQuizId(req, res) {
    let moduleId = req.query.moduleId;
    let quizId = await workerServices.getPracticeQuiz(moduleId);
    if (quizId) {
        res.json({ success: 1, quizId: quizId._id });
    } else {
        res.json({ success: 0 });
    }
}

// Retrieve the training quiz ID for a specific subject and send it to the client
// Input: req (request object containing subjectId), res (response object)
// Output: JSON response with the training quiz ID and a success status
async function trainingQuizId(req, res) {
    let subjectId = req.query.subjectId;
    let quizId = await workerServices.getTrainingQuiz(subjectId);
    if (quizId) {
        res.json({ success: 1, quizId: quizId._id });
    } else {
        res.json({ success: 0 });
    }
}

// Check if the current user has permission to take a quiz and respond accordingly
// Input: req (request object containing token and quizId), res (response object)
// Output: JSON response with a success status (1 if permitted, 0 if denied)
async function takeQuiz(req, res) {
    let token = req.query.token;
    let myId = jwt.verify(token, process.env.JWT_SECRET)["user"]["_id"];
    let quizId = req.query.quizId;
    //first verify user then do this
    let permit = await workerServices.takeQuiz(myId, quizId);
    if (permit == 1) {
        res.json({ success: 1 });
    } else {
        res.json({ success: 0 });
    }
}

// Get information about the current worker's quiz session
// Input: quizId (from request query), token (from request query)
// Output: JSON response with success status and quiz information
async function getSession(req, res) {
    let quizId = req.query.quizId;
    let token = req.query.token;
    let myId = jwt.verify(token, process.env.JWT_SECRET)["user"]["_id"];
    let quiz = await workerServices.getSession(quizId, myId);
    res.json({ success: 1, quiz: quiz });
}

// Submit a user's quiz responses and record the submission
// Input: req (request object containing token, quizId, and questions_answers),
//        res (response object)
// Output: JSON response with a success status (1 for successful submission, 0 for failure)
async function submitQuiz(req, res) {
    let token = req.query.token;
    let myId = jwt.verify(token, process.env.JWT_SECRET)["user"]["_id"];
    let quizId = req.body.quizId;
    let questions_answers = req.body.questions_answers;
    let end_time = new Date();
    let submit = await workerServices.submitQuiz(
        myId,
        questions_answers,
        quizId,
        end_time
    );
    res.json({ success: submit });
}

// Retrieve training certificates for the current user and send them as a JSON response
// Input: req (request object containing the user's token), res (response object)
// Output: JSON response with training certificates and a success status (1 for success)
async function trainingCertificate(req, res) {
    let token = req.query.token;
    let myId = jwt.verify(token, process.env.JWT_SECRET)["user"]["_id"];
    let certificates = await workerServices.trainingCertificate(myId, 0);
    res.json({ certificates, success: 1 });
}

// Retrieve final certificates for the current user and send them as a JSON response
// Input: req (request object containing the user's token), res (response object)
// Output: JSON response with final certificates and a success status (1 for success)
async function finalCertificate(req, res) {
    let token = req.query.token;
    let myId = jwt.verify(token, process.env.JWT_SECRET)["user"]["_id"];
    let certificates = await workerServices.trainingCertificate(myId, 1);
    res.json({ certificates, success: 1 });
}

// Retrieve the user's quiz history based on the quiz type and send it as a JSON response
// Input: req (request object containing the user's token and the quiz type), res (response object)
// Output: JSON response with the user's quiz history for the specified type
async function history(req, res) {
    //0-practice, 1-training, 2-final, 3-general
    let type = req.query.type;
    let token = req.query.token;
    let myId = jwt.verify(token, process.env.JWT_SECRET)["user"]["_id"];
    let myHistory = await workerServices.history(type, myId);
    res.json({ myHistory });
}

// Generate a PDF certificate for a worker based on the certificate ID and user's token
// Input: req (request object with certificate ID and user's token), res (response object)
// Output: JSON response with a URI to the generated certificate PDF or a failure message
async function generateCertificatePdf(req, res) {
    let certificateId = req.query.certificateId;
    console.log(certificateId);
    let token = req.query.token;

    // Check if the certificate PDF already exists and return its URI if found
    if (
        fs.existsSync(
            `./public/files/workers/certificates/${certificateId}.pdf`
        )
    ) {
        res.json({
            uri: `/files/workers/certificates/${certificateId}.pdf`,
            success: 1,
        });
    } else {
        // Check if the certificate record exists in the database
        let certificateExists = await workerServices.checkCertificate(
            certificateId
        );

        if (certificateExists) {
            // Launch a headless browser with Puppeteer
            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();
            let web_url = null;
            let date = new Date(certificateExists.createdAt).getTime();

            // Determine the URL for the certificate template based on the certificate type
            if (certificateExists.type == 0) {
                website_url = `http://localhost:3000/worker/putDataInCertificate?token=${token}&name=${certificateExists.workerId.name}&subject=${certificateExists.subjectId.name}&date=${date}&type=0&certificateId=${certificateId}`;
            } else {
                website_url = `http://localhost:3000/worker/putDataInCertificate?token=${token}&name=${certificateExists.workerId.name}&subject=${certificateExists.subjectId.name}&date=${date}&type=1&certificateId=${certificateId}`;
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
                path: `./public/files/workers/certificates/${certificateId}.pdf`,
                preferCSSPageSize: true,
                pageRanges: "1",
            });

            // Close the browser
            await browser.close();

            res.json({
                uri: `/files/workers/certificates/${certificateId}.pdf`,
                success: 1,
            });
            // res.json({success:1})
        } else {
            res.json({ success: 0 });
        }
    }
}

// Render a certificate template with dynamic data
// Input: req (request object with user name, subject, date, and certificate type), res (response object)
// Output: Rendered certificate template (HTML) with dynamic data
async function putDataInCertificate(req, res) {
    let name = req.query.name;
    let subject = req.query.subject;
    let certificateId = req.query.certificateId;
    let coordinator = req.query.coordinator;
    let url = `http://192.168.1.14:3000/files/workers/certificates/${certificateId}.pdf`;
    url = encodeURI(url);
    function convertDate(inputFormat) {
        function pad(s) {
            return s < 10 ? "0" + s : s;
        }
        var d = new Date(inputFormat);
        return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join(
            "/"
        );
    }
    let date = convertDate(new Date(parseInt(req.query.date)));
    if (req.query.type == 0) {
        res.render("./partials/trainingCertificate", {
            name,
            subject,
            date,
            certificateId,
            url,
        });
    } else {
        res.render("./partials/finalCertificate", {
            name,
            subject,
            date,
            certificateId,
            url,
            coordinator
        });
    }
}

// Retrieve the quiz history for a given session
// Input: req (request object with session ID), res (response object)
// Output: Quiz history data for the specified session
async function getQuizHistory(req, res) {
    let sessionId = req.query.sessionId;
    let quiz = await workerServices.getQuizHistory(sessionId);
    res.json({ success: 1, quiz });
}

// Retrieve bookmarked topics with moduleName for a specific worker and subject
// Input: req (request object with user token and subject ID), res (response object)
// Output: Bookmarked topics for the specified worker and subject
async function getBookmarks(req, res) {
    let token = req.query.token;
    let myId = jwt.verify(token, process.env.JWT_SECRET)["user"]["_id"];
    let subjectId = req.query.subjectId;
    let bookmarks = await workerServices.getBookmarks(myId, subjectId);
    res.json({ success: 1, bookmarks });
}

// Retrieve and render analysis data for a specific session
// Input: req (request object with session ID), res (response object)
// Output: Render a chart page with analysis data for the specified session
async function analysis(req, res) {
    let sessionId = req.query.sessionId;
    let analysis = await workerServices.analysis(sessionId);
    res.render("./worker/chart", { analysis });
}

async function generalAnalysis(req, res) {
    let sessionId = req.query.sessionId;
    let analysis = await workerServices.generalAnalysis(sessionId);
    res.render("./worker/generalChart", { analysis });
    // res.json({ analysis });
}

async function verifyPhotoFunction(photos, myImage) {
    const images = await Promise.all(
        photos.map((ele) => loadImage("./public/files/workers/" + ele))
    );
    let detections = [];
    for (let index = 0; index < images.length; index++) {
        const element = images[index];
        detections.push(
            await faceapi
                .detectSingleFace(element)
                .withFaceLandmarks()
                .withFaceDescriptor()
        );
    }
    const myPhoto = await loadImage(myImage);
    let temp = await faceapi
        .detectSingleFace(myPhoto)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (temp) {
        const newDescriptor = temp.descriptor;
        const distances = detections.map((descriptor) =>
            faceapi.euclideanDistance(descriptor.descriptor, newDescriptor)
        );
        console.log(distances);
        const threshold = 0.4;
        const isMatch = distances.some((distance) => distance < threshold);
        fs.rm(myImage, () => {});
        if (isMatch) {
            return 1;
        } else {
            return 0;
        }
    } else {
        fs.rm(myImage, () => {});
        return 0;
    }
}

async function verifyPhoto(req, res) {
    let token = req.query.token;

    let myId = jwt.verify(token, process.env.JWT_SECRET)["user"]["_id"];
    let photos = await workerServices.getWorkerPhotos(myId);
    let flag = await verifyPhotoFunction(photos, req.file.path);
    res.json({ success: flag });
}

async function disqualifyPhoto(req, res) {
    let token = req.query.token;
    let myId = jwt.verify(token, process.env.JWT_SECRET)["user"]["_id"];
    let quizId = req.query.quizId;
    let reason = req.query.reason; //0 - no face detected, 1 - Different face detected, 2 - multiple faces detected, 3 - home screen
    let photo = req.file.filename;
    if (reason == 1) {
        let photos = await workerServices.getWorkerPhotos(myId);
        let temp = await verifyPhotoFunction(photos, req.file.path);
        if (temp == 0) {
            await workerServices.disqualifyPhoto(myId, quizId, photo, reason);
        }
    } else {
        await workerServices.disqualifyPhoto(myId, quizId, photo, reason);
    }
    res.json({ success: 1 });
}

async function disqualifyBackground(req, res) {
    let token = req.query.token;
    let myId = jwt.verify(token, process.env.JWT_SECRET)["user"]["_id"];
    let quizId = req.query.quizId;
    let reason = req.query.reason;
    await workerServices.disqualifyPhoto(myId, quizId, null, reason);
    res.json({ success: 1 });
}

async function generalQuiz(req, res) {
    let quizzes = await workerServices.generalQuiz();
    res.json({ quizzes, success: 1 });
}

async function leaderboard(req, res) {
    let token = req.query.token;
    let myId = jwt.verify(token, process.env.JWT_SECRET)["user"]["_id"];
    let quizId = req.query.quizId;
    let leaderboard = await workerServices.leaderboard(quizId, myId);
    let myRank = 1;
    leaderboard.forEach((ele, ind) => {
        if (ele[0] == myId) {
            myRank = ind;
            return;
        }
    });
    res.json({ leaderboard, myRank });
}

async function performance(req, res) {
    let token = req.query.token;
    let myId = jwt.verify(token, process.env.JWT_SECRET)["user"]["_id"];
    let { subjectId, type, moduleId } = req.query;
    let data = null;
    if (type >= 1) {
        data = await workerServices.performance(
            myId,
            subjectId,
            type,
            moduleId
        );
    } else {
        data = await workerServices.radialPerformance(myId, subjectId);
    }
    console.log(data);
    if (type >= 1) {
        res.render("./worker/performance", { data });
    } else {
        res.render("./worker/radialPerformance", { data });
    }
}

async function moduleRating(req, res) {
    let token = req.query.token;
    let myId = jwt.verify(token, process.env.JWT_SECRET)["user"]["_id"];
    let { moduleId, feedback, rating } = req.body;
    await workerServices.moduleRating(myId, moduleId, feedback, rating);
    res.json({ success: 1 });
}

async function getComments(req, res) {
    let { topicId } = req.query;
    let comments = await workerServices.getComments(topicId);
    res.json({ success: 1, comments });
}

async function addComment(req, res) {
    let { topicId, message } = req.body;
    let token = req.query.token;
    let myId = jwt.verify(token, process.env.JWT_SECRET)["user"]["_id"];
    await workerServices.addComment(myId, topicId, message);
    res.json({ success: 1 });
}

async function addReply(req, res) {
    let { commentId, message, topicId } = req.body;
    let token = req.query.token;
    let myId = jwt.verify(token, process.env.JWT_SECRET)["user"]["_id"];
    await workerServices.addReply(myId, topicId, commentId, message);
    res.json({ success: 1 });
}

module.exports = {
    workerSignup,
    workerLogin,
    fetchDistrict,
    getModules,
    getSubjects,
    getTopics,
    upcomingQuiz,
    profile,
    bookmarkTopic,
    completeTopic,
    availableQuiz,
    takeQuiz,
    getSession,
    submitQuiz,
    practiceQuizId,
    trainingCertificate,
    finalCertificate,
    trainingQuizId,
    history,
    generateCertificatePdf,
    putDataInCertificate,
    getQuizHistory,
    analysis,
    getBookmarks,
    workerPhoto,
    verifyPhoto,
    disqualifyPhoto,
    disqualifyBackground,
    generalQuiz,
    workerLogout,
    generalAnalysis,
    leaderboard,
    performance,
    moduleRating,
    addMySubject,
    addComment,
    addReply,
    getComments,
};
