const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
    {
        moduleName: String,
        topics: [{ type: mongoose.SchemaTypes.ObjectId, ref: "topics" }],
        rating: Number,
        subjectId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "subjects",
        },
        order: Number,
    },
    { timestamps: true }
);
module.exports = mongoose.model("modules", moduleSchema, "modules");