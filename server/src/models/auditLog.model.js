const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'INSTRUCTOR', 'STUDENT', 'SYSTEM', 'ANONYMOUS'],
      default: 'SYSTEM'
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true
    },
    resourceType: {
      type: String,
      required: [true, 'Resource type is required'],
      trim: true
    },
    resourceId: {
      type: String,
      default: null
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE'],
      default: 'SUCCESS'
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ action: 1, resourceType: 1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
