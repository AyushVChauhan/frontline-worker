const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
    {
        name: String,
        created_by: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "administrations",
        },
        updated_by: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "administrations",
        },
        valid_from: Date,
        valid_to: Date,
        duration: Number,
        visible_from: Date,
        type: Number, //0 - Practice, 1 - Training, 2 - Final, 3 - Training Assessment(Multiple Subjects)
        subjectId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "subjects",
        },
        moduleId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "modules",
        },
        compulsary_questions: [
            {
                question: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "questions",
                },
                marks: Number,
            },
        ],
        random_questions: [
            {
                question: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "questions",
                },
                marks: Number,
            },
        ],
        marks_questions: [{ marks: Number, count: Number }],
        is_active: { type: Number, default: 1 },
        faceDetection: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("quizzes", quizSchema, "quizzes");
