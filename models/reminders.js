const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
    date: Date,
    message: String,
    title: String,
    issent: {
        type: Number,
        default: 0,
    },
    workerIds: [{ type: mongoose.SchemaTypes.ObjectId, ref: "workers" }],
});

module.exports = mongoose.model("reminders", reminderSchema, "reminders");
