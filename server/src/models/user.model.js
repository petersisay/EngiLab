const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('./department.model');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },
    role: {
      type: String,
      enum: {
        values: ['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'INSTRUCTOR', 'STUDENT'],
        message: 'Role must be SUPER_ADMIN, DEPARTMENT_ADMIN, INSTRUCTOR, or STUDENT'
      },
      default: 'STUDENT'
    },
    studentId: {
      type: String,
      trim: true,
      default: null
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    academicYear: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING', 'SUSPENDED'],
      default: 'ACTIVE'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    avatar: {
      type: String,
      default: ''
    },
    isEmailVerified: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.virtual('firstName').get(function () {
  return this.name ? this.name.split(' ')[0] : '';
});

userSchema.virtual('lastName').get(function () {
  if (!this.name) return '';
  const parts = this.name.split(' ');
  return parts.slice(1).join(' ') || '';
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to check password validity (safely retrieves password if excluded via select)
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    const userWithPassword = await this.constructor.findById(this._id).select('+password');
    if (!userWithPassword || !userWithPassword.password) return false;
    return bcrypt.compare(candidatePassword, userWithPassword.password);
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe JSON serialization (strip password)
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.index({ role: 1 });
userSchema.index({ department: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
