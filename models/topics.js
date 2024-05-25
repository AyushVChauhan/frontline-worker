const mongoose = require("mongoose");
const topicsSchema = new mongoose.Schema(
    {
        moduleId: { type: mongoose.SchemaTypes.ObjectId, ref: "modules" },
        topic: String,
        content: String,
        resources: [{ name: String, path: String }], //PDFs
        links: [String], //Youtube Links
        order: Number, //For Ordering of Topics
        is_active: Number,
    },
    { timestamps: true }
);
module.exports = mongoose.model("topics", topicsSchema, "topics");
