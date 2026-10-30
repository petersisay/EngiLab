const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required']
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required']
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: [true, 'Semester reference is required']
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    status: {
      type: String,
      enum: ['ENROLLED', 'COMPLETED', 'DROPPED'],
      default: 'ENROLLED'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

enrollmentSchema.index({ student: 1, course: 1, semester: 1 }, { unique: true });
enrollmentSchema.index({ course: 1, status: 1 });
enrollmentSchema.index({ student: 1, status: 1 });

const CourseEnrollment = mongoose.model('CourseEnrollment', enrollmentSchema);

module.exports = CourseEnrollment;
