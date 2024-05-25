const mongoose = require("mongoose");

const administrationSchema = new mongoose.Schema(
    {
        username: String,
        name: String,
        districtId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "districts",
        }, // only for authority
        email: String,
        phone: String,
        password: String,
        role: Number, // 0 : coordinator, 1 : authority, 2 : admin
        subjectIds: [
            { type: mongoose.SchemaTypes.ObjectId, ref: "subjects" },
        ],
        is_active: Number,
    },
    { timestamps: true }
);

module.exports = mongoose.model("administrations", administrationSchema, "administrations");
