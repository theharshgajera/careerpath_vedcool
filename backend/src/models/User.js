"use strict";
// // models/User.ts
// import mongoose, { Document } from 'mongoose';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// export interface IUser extends Document {
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
//   phoneNumber: string;
//   schoolName: string;
//   standard: string;
// }
// const userSchema = new mongoose.Schema<IUser>({
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   phoneNumber: { type: String, required: true },
//   schoolName: { type: String, required: true },
//   standard: { type: String, required: true }
// });
// export default mongoose.model<IUser>('User', userSchema);
// // models/User.ts
// import mongoose, { Document } from 'mongoose';
// import bcrypt from 'bcryptjs';
// export interface IUser extends Document {
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
//   phoneNumber: string;
//   schoolName: string;
//   standard: string;
//   createdAt?: Date;
//   updatedAt?: Date;
//   age?: string; // Optional age field
//   interests?: string; // Optional interests field
//   academicInfo: string;
//   comparePassword(candidatePassword: string): Promise<boolean>;
// }
// const userSchema = new mongoose.Schema<IUser>({
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   phoneNumber: { type: String, required: true },
//   schoolName: { type: String, required: true },
//   standard: { type: String, required: true },
//   age: { type: String, required: true },
//   interests: { type: String, required: true },
//   academicInfo: { type: String, required: true }
// }, { timestamps: true });
// userSchema.pre<IUser>('save', async function (next) {
//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });
// userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
//   return bcrypt.compare(candidatePassword, this.password);
// };
// export default mongoose.model<IUser>('User', userSchema);
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    schoolName: { type: String, required: true },
    standard: { type: String, required: true },
    age: { type: String, required: true },
    interests: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    academicInfo: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Analyzing', 'Report Generated', 'Error'],
        default: 'Pending'
    },
    reportPath: {
        type: String
    },
    reportUploadedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        try {
            const salt = await bcryptjs_1.default.genSalt(10);
            this.password = await bcryptjs_1.default.hash(this.password, salt);
        }
        catch (error) {
            return next(error);
        }
    }
    next();
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcryptjs_1.default.compare(candidatePassword, this.password);
    }
    catch (error) {
        throw new Error('Password comparison failed');
    }
};
exports.default = mongoose_1.default.model('User', userSchema);
