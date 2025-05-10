import mongoose from 'mongoose';

const QuestionnaireSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
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
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  skillScores: {
    type: mongoose.Schema.Types.Mixed,
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

export default mongoose.model('Questionnaire', QuestionnaireSchema);