const mongoose = require("mongoose");
const questionsSchema = new mongoose.Schema(
    {
        topicId: [{ type: mongoose.SchemaTypes.ObjectId, ref: "topics" }],
        question: String,
        created_by: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "administrations",
        },
        updated_by: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "administrations",
        },
        marks: Number,
        type: Number, //1-MCQ , 2-ONE_WORD , 3-DESCRIPTIVE
        files: [{ description: String, file: String }],
        difficulty: Number, //1-EASY, 2-MEDIUM, 3-HARD
        options: [{ option: String, file: String }],
        answer: String,
        is_active: Number,
        time_required: Number, //Seconds
        caseSensitive: { type: Number, default: 1 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("questions", questionsSchema, "questions");
