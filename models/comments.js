const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        workerId: { type: mongoose.SchemaTypes.ObjectId, ref: "workers" },
        administrationId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "administrations",
        },
        content: String,
        replies: [{ type: mongoose.SchemaTypes.ObjectId, ref: "comments" }],
        topicId: { type: mongoose.SchemaTypes.ObjectId, ref: "topics" },
        is_active: Number,
        is_reply: Number,
    },
    { timestamps: true }
);

module.exports = mongoose.model("comments", commentSchema, "comments");
