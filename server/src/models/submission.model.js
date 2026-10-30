const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
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
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubmissionGroup',
      default: null
    },
    submissionType: {
      type: String,
      enum: ['INDIVIDUAL', 'GROUP'],
      default: 'INDIVIDUAL'
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true
    },
    fileSize: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['PENDING', 'GRADED', 'RETURNED', 'LATE'],
      default: 'PENDING'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    version: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

submissionSchema.index({ exercise: 1, student: 1 });
submissionSchema.index({ exercise: 1, group: 1 });
submissionSchema.index({ course: 1, status: 1 });
submissionSchema.index({ student: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
