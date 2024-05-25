const { default: mongoose } = require("mongoose");
const modules = require("../../models/modules");
const quizzes = require("../../models/quizzes");
const reminders = require("../../models/reminders");
const workers = require("../../models/workers");
const subjects = require("../../models/subjects");
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
module.exports.addModule = async function (req, res) {
    let oldModules = await modules.count({ subjectId: req.body.subjectId });
    let module = new modules({
        moduleName: req.body.moduleName,
        subjectId: req.body.subjectId,
        order: oldModules + 1,
        rating: 0,
    });
    await module.save();
    let quiz = new quizzes({
        is_active: 1,
        type: 0,
        marks_questions: [{ marks: 1, count: 10 }],
        duration: 10,
        random_questions: [],
        moduleId: module._id,
        name: module.moduleName + " Practice Test",
        subjectId: module.subjectId,
        valid_from: new Date(2023, 1, 1),
        valid_to: new Date(3023, 1, 1),
        visible_from: new Date(2023, 1, 1),
    });
    await quiz.save();
    moduleReminder(quiz.subjectId)
    res.redirect(`/coordinator/modules/${req.body.subjectId}`);
};

async function moduleReminder(subjectId) {
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
    let subject = await subjects.findOne({_id:subjectId});
    setReminder(new Date(), `New Module Has Been Added in ${subject.name} Subject`, "New Module Added", worker);
}
