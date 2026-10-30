const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Academic year name is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Academic year code is required'],
      unique: true,
      trim: true
    },
    isCurrent: {
      type: Boolean,
      default: false
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

academicYearSchema.index({ code: 1 });
academicYearSchema.index({ isCurrent: 1 });

const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);

module.exports = AcademicYear;
