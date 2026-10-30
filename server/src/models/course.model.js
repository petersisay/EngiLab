const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Course code is required'],
      trim: true,
      uppercase: true
    },
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required']
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: [true, 'Semester reference is required']
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      default: null
    },
    credits: {
      type: Number,
      default: 2,
      min: [1, 'Credits must be at least 1']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    instructors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

courseSchema.index({ code: 1, department: 1 });
courseSchema.index({ department: 1, semester: 1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
