const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true
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
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Group leader reference is required']
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

groupSchema.index({ exercise: 1, leader: 1 });
groupSchema.index({ exercise: 1, members: 1 });

const SubmissionGroup = mongoose.model('SubmissionGroup', groupSchema);

module.exports = SubmissionGroup;
