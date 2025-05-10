
// // models/User.ts
// import mongoose, { Document } from 'mongoose';

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

import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  schoolName: string;
  standard: string;
  createdAt?: Date;
  updatedAt?: Date;
  age?: string;
  interests?: string;
  academicInfo: string;
  status: 'Pending' | 'Analyzing' | 'Report Generated' | 'Error';
  reportPath?: string;
  reportUploadedAt?: Date; // New field for upload timestamp
  isAdmin: boolean;
  role?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
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
  reportUploadedAt: { // New field
    type: Date,
    default: null
  }
}, { timestamps: true });

userSchema.pre<IUser>('save', async function(next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error as mongoose.CallbackError);
    }
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

export default mongoose.model<IUser>('User', userSchema);