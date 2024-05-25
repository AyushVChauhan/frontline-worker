const mongoose = require("mongoose");
const sessionSchema = new mongoose.Schema(
    {
        workerId: { type: mongoose.SchemaTypes.ObjectId, ref: "workers" },
        quizId: { type: mongoose.SchemaTypes.ObjectId, ref: "quizzes" },
        status: Number, //0=Pending,1=Submitted,2=Disqualify
        start_time: Date,
        end_time: Date,
        ip: String,
        questions_answers: [
            {
                question: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "questions",
                },
                answer: String,
                marks: Number,
                time_spent: Number, //Seconds
            },
        ],
        is_evaluated: { type: Number, default: 0 },
        is_active: Number,
        remarks: [{ reason: Number, file: String }], //0 - no face detected, 1 - Different face detected, 2 - multiple faces detected, 3 - home screen
    },
    { timestamps: true }
);

module.exports = mongoose.model("sessions", sessionSchema, "sessions");
