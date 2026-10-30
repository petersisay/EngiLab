const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: [true, 'Submission reference is required']
    },
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LaboratoryExercise',
      required: [true, 'Exercise reference is required']
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required']
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required']
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor reference is required']
    },
    score: {
      type: Number,
      required: [true, 'Grade score is required'],
      min: [0, 'Score cannot be negative']
    },
    maxScore: {
      type: Number,
      default: 100
    },
    rubrics: [
      {
        criterion: { type: String, trim: true },
        score: { type: Number, min: 0 },
        maxScore: { type: Number, min: 0 },
        remarks: { type: String, trim: true, default: '' }
      }
    ],
    feedback: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED'],
      default: 'PUBLISHED'
    },
    gradedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

gradeSchema.index({ submission: 1 }, { unique: true });
gradeSchema.index({ exercise: 1, student: 1 });
gradeSchema.index({ course: 1, student: 1 });

const Grade = mongoose.model('Grade', gradeSchema);

module.exports = Grade;
