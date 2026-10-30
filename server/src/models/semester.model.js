const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Semester name is required'],
      trim: true
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Academic year reference is required']
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    isCurrent: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

semesterSchema.index({ academicYear: 1, name: 1 });
semesterSchema.index({ isCurrent: 1 });

const Semester = mongoose.model('Semester', semesterSchema);

module.exports = Semester;
