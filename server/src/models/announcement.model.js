const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Announcement content is required'],
      trim: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author reference is required']
    },
    targetScope: {
      type: String,
      enum: ['GLOBAL', 'DEPARTMENT', 'COURSE'],
      default: 'GLOBAL'
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null
    },
    isPinned: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

announcementSchema.index({ targetScope: 1, department: 1, course: 1 });
announcementSchema.index({ createdAt: -1 });

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
