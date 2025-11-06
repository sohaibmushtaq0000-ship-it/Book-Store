const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please provide a valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(phone) {
        return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
      },
      message: 'Please provide a valid phone number'
    }
  },

  // Role and Status
  role: {
    type: String,
    enum: ['superadmin', 'publisher', 'customer'],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },

  // Profile Image
  profileImage: {
    url: {
      type: String,
      default: null
    },
    filename: {
      type: String,
      default: null
    },
    uploadedAt: {
      type: Date,
      default: null
    }
  },

  // CNIC Information
  cnic: {
    number: {
      type: String,
      trim: true,
      validate: {
        validator: function(cnic) {
          if (!cnic) return true; // Optional for some roles
          return /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/.test(cnic);
        },
        message: 'CNIC must be in format: 12345-1234567-1'
      }
    },
    frontImage: {
      url: {
        type: String,
        default: null
      },
      filename: {
        type: String,
        default: null
      },
      verified: {
        type: Boolean,
        default: false
      },
      uploadedAt: {
        type: Date,
        default: null
      }
    },
    backImage: {
      url: {
        type: String,
        default: null
      },
      filename: {
        type: String,
        default: null
      },
      verified: {
        type: Boolean,
        default: false
      },
      uploadedAt: {
        type: Date,
        default: null
      }
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'not_submitted'],
      default: 'not_submitted'
    },
    rejectionReason: {
      type: String,
      default: null
    }
  },

  // Address Information
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'Pakistan'
    },
    zipCode: {
      type: String,
      trim: true
    }
  },

  // Timestamps and Activity
  lastLogin: {
    type: Date,
    default: null
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for complete address
userSchema.virtual('completeAddress').get(function() {
  if (!this.address.street) return null;
  return `${this.address.street}, ${this.address.city}, ${this.address.state}, ${this.address.country} ${this.address.zipCode}`;
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'cnic.verificationStatus': 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-save middleware to set passwordChangedAt
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Pre-save middleware to update profileCompleted status
userSchema.pre('save', function(next) {
  const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
  const hasRequiredFields = requiredFields.every(field => this[field]);
  
  this.profileCompleted = hasRequiredFields;
  next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to update CNIC verification status
userSchema.methods.updateCNICVerification = function(status, reason = null) {
  this.cnic.verificationStatus = status;
  this.cnic.rejectionReason = reason;
  
  if (status === 'verified') {
    this.cnic.frontImage.verified = true;
    this.cnic.backImage.verified = true;
  }
};

// Instance method to check if CNIC is submitted
userSchema.methods.hasSubmittedCNIC = function() {
  return this.cnic.frontImage.url !== null && 
         this.cnic.backImage.url !== null &&
         this.cnic.number !== null;
};

// Instance method to get user profile for response
userSchema.methods.getProfile = function() {
  const userObj = this.toObject();
  
  // Remove sensitive fields
  delete userObj.password;
  delete userObj.passwordChangedAt;
  delete userObj.passwordResetToken;
  delete userObj.passwordResetExpires;
  delete userObj.emailVerificationToken;
  delete userObj.emailVerificationExpires;
  
  return userObj;
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Static method to find users with pending CNIC verification
userSchema.statics.findPendingCNICVerification = function() {
  return this.find({ 
    'cnic.verificationStatus': 'pending',
    isActive: true 
  });
};

module.exports = mongoose.model('User', userSchema);