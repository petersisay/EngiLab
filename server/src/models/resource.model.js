const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required']
    },
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LaboratoryExercise',
      default: null
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
    fileType: {
      type: String,
      enum: ['PDF', 'DOCUMENT', 'SLIDES', 'SPREADSHEET', 'CODE', 'OTHER'],
      default: 'PDF'
    },
    fileSize: {
      type: Number,
      default: 0
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader reference is required']
    }
  },
  {
    timestamps: true
  }
);

resourceSchema.index({ course: 1 });
resourceSchema.index({ exercise: 1 });

const LearningResource = mongoose.model('LearningResource', resourceSchema);

module.exports = LearningResource;
