const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
    {
        name: String,
        is_active: { type: Number, default: 1 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("subjects", subjectSchema, "subjects");
