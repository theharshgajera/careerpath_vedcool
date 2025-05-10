"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const QuestionnaireSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    age: {
        type: String,
        default: ''
    },
    academicInfo: {
        type: String,
        default: ''
    },
    interests: {
        type: String,
        default: ''
    },
    answers: {
        type: mongoose_1.default.Schema.Types.Mixed,
        default: {}
    },
    skillScores: {
        type: mongoose_1.default.Schema.Types.Mixed,
        default: {}
    },
    currentQuestion: {
        type: Number,
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Questionnaire', QuestionnaireSchema);
