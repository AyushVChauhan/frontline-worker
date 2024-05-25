const { default: mongoose } = require("mongoose");
const topics = require("../../models/topics");
const modules = require("../../models/modules");
const reminders = require("../../models/reminders");
const subjects = require("../../models/subjects");
const workers = require("../../models/workers");
module.exports.addTopic = async function (req, res) {
    let resourcesarray = [];
    req.files.forEach((ele, ind) => {
        resourcesarray.push({
            name: req.body.resourcesNames[ind],
            path: "./files/" + ele.filename,
        });
    });
    let oldTopics = await topics.count({ moduleId: req.body.moduleId });
    let topic = new topics({
        moduleId: req.body.moduleId,
        topic: req.body.topic,
        content: req.body.content,
        resources: resourcesarray, //PDFs
        links: req.body.links, //Youtube Links
        order: oldTopics + 1, //For Ordering of Topics
    });
    await topic.save();
    let module = await modules.findOne({ _id: req.body.moduleId });
    module.topics.push(topic._id);
    await module.save();
    topicReminder(module.moduleName);
    res.json({
        success: 1,
    });
};
async function topicReminder(moduleName) {
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
    setReminder(new Date(), `New Topic Has Been Added in ${moduleName} Module`, "New Topic Added", worker);
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