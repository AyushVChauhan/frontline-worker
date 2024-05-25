const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
    {
        workerId: { type: mongoose.SchemaTypes.ObjectId, ref: "workers" },
        moduleId: { type: mongoose.SchemaTypes.ObjectId, ref: "modules" },
        rating: Number, //out of 5
        feedback:String,
    },
    { timestamps: true }
);
module.exports = mongoose.model("ratings", ratingSchema, "ratings");
