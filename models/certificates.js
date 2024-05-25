const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
    {
        workerId: { type: mongoose.SchemaTypes.ObjectId, ref: "workers" },
        type: Number, //0 - Training, 1 - Final
        subjectId: { type: mongoose.SchemaTypes.ObjectId, ref: "subjects" },
        sessionId: { type: mongoose.SchemaTypes.ObjectId, ref: "sessions" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("certificates", certificateSchema ,"certificates");
