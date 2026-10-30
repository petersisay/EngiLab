const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Exercise title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Exercise description is required'],
      trim: true
    },
    objectives: [
      {
        type: String,
        trim: true
      }
    ],
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required']
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor reference is required']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: function () {
        return this.instructor || null;
      }
    },
    exerciseNumber: {
      type: String,
      trim: true,
      default: ''
    },
    weekNumber: {
      type: Number,
      default: 1
    },
    orderIndex: {
      type: Number,
      default: 1
    },
    instructions: {
      type: String,
      trim: true,
      default: ''
    },
    attachments: [
      {
        name: { type: String, trim: true },
        url: { type: String, trim: true },
        fileType: { type: String, trim: true }
      }
    ],
    deadline: {
      type: Date,
      required: [true, 'Submission deadline is required']
    },
    maxScore: {
      type: Number,
      default: 100,
      min: [1, 'Maximum score must be greater than 0']
    },
    submissionType: {
      type: String,
      enum: ['INDIVIDUAL', 'GROUP'],
      default: 'INDIVIDUAL'
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'PUBLISHED'
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

exerciseSchema.index({ course: 1, status: 1 });
exerciseSchema.index({ instructor: 1 });
exerciseSchema.index({ deadline: 1 });

const LaboratoryExercise = mongoose.model('LaboratoryExercise', exerciseSchema);

module.exports = LaboratoryExercise;
