const mongoose = require("mongoose");
const districtSchema = new mongoose.Schema(
    {
        name: String,
        authorityId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "administrations",
        },
        is_active: {
            type: Number,
            default: 1,
        },
    },
    { timestamps: true }
);
module.exports = mongoose.model("districts", districtSchema, "districts");
