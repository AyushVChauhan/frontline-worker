const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            require: true,
            unique: true,
            // dropdub: true,
            // index: true,
        },
        name: {
            type: String,
            require: true,
        },
        districtId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "districts",
            require: true,
        },
        updatedBy: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "administations",
        },
        email: {
            type: String,
            require: true,
        },
        phone: {
            type: String,
            require: true,
        },
        password: {
            type: String,
            require: true,
        },
        is_active: {
            type: Number,
            default: 1,
        },
        dateOfBirth: {
            type: Date,
            require: true,
        },
        aadharCard: {
            type: String,
            require: true,
        },
        photo: {
            type: String,
            require: true,
        },
        faces: [String],
        topicsCompleted: {
            type: [
                {
                    dateOfCompletion: { type: Date, required: true },
                    topic: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "topics",
                        required: true,
                    },
                },
            ],
        },
        topicsBookmarked: {
            type: [
                {
                    dateOfBookmark: Date,
                    topic: {
                        type: mongoose.SchemaTypes.ObjectId,
                        ref: "topics",
                    },
                },
            ],
        },
        certificates: [
            {
                certificateType: Number,
                certificate: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "certificates",
                },
            },
        ],
        androidId: { type: String, default: null },
        pushToken: String,
        enrolledSubjects: [
            {
                startDate: Date,
                endDate: Date,
                subject: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "subjects",
                },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("workers", workerSchema, "workers");
