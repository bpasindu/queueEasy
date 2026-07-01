/**
 * QueueEase V2 — Auth Controller
 * Handles registration, login, Firebase auth, and token management.
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const config = require('../config');
const { sendPasswordResetEmail } = require('../services/emailService');

// Generate JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res, message = 'Authentication successful') => {
  const token = signToken(user._id);
  
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    isActive: user.isActive,
    isVerified: user.isVerified,
  };
  
  return sendSuccess(res, { token, user: userData }, message, statusCode);
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, ...extraFields } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'Email already registered', 409);
    }
    
    // Create user with role-specific fields
    const userData = { name, email, phone, password, role };
    
    // Doctor-specific
    if (role === 'doctor') {
      // Issue #10 fix: previously `medicalLicenseNo` was accepted as a
      // free-text field with no validation, so anyone could create a
      // doctor account (which grants access to patient records and
      // queue/appointment management). This app cannot call the Sri
      // Lanka Medical Council registry directly, so as a compensating
      // control we (a) require a plausibly-formatted SLMC registration
      // number, and (b) require a human administrator to verify the
      // account (see authController.verifyUser + requireVerified
      // middleware) before any patient-data routes become accessible.
      const licenseNo = String(extraFields.medicalLicenseNo || '').trim();
      if (!licenseNo) {
        return sendError(res, 'A medical license / SLMC registration number is required for doctor accounts', 400);
      }
      if (!/^[A-Za-z0-9\-\/]{4,30}$/.test(licenseNo)) {
        return sendError(res, 'Medical license number format looks invalid', 400);
      }

      userData.specialization = extraFields.specialization;
      userData.medicalLicenseNo = licenseNo;
      userData.isVerified = false; // requires admin verification before use
    }
    
    // Receptionist-specific
    if (role === 'receptionist') {
      if (!extraFields.clinicId) {
        return sendError(res, 'A clinicId is required for receptionist accounts', 400);
      }
      userData.employedClinicId = extraFields.clinicId;
      userData.employeeId = extraFields.employeeId;
      userData.isVerified = false; // requires admin verification before use
    }
    
    // Patient-specific
    if (role === 'patient') {
      userData.bloodType = extraFields.bloodType;
      userData.allergies = extraFields.allergies;
      userData.emergencyContact = extraFields.emergencyContact;
      // Patients don't go through the verification gate.
      userData.isVerified = true;
    }
    
    const user = await User.create(userData);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const message = ['doctor', 'receptionist'].includes(role)
      ? 'Account created. A clinic administrator must verify your account before you can access patient data.'
      : 'Authentication successful';
    
    sendTokenResponse(user, 201, res, message);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password) {
      return sendError(res, 'Please provide email and password', 400);
    }
    
    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }
    
    if (!user.isActive) {
      return sendError(res, 'Account has been deactivated', 403);
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Issue #9 fix: the Login screen lets the user pick "Patient" or
    // "Doctor / Staff" before signing in. Previously that selection was
    // never sent to (or checked by) the server, so it was purely
    // cosmetic. Now, if a role is supplied, it must match the account's
    // actual role — this prevents a doctor/receptionist from
    // accidentally (or deliberately) landing on the patient experience
    // for an account that actually has elevated access, and gives a
    // clear error instead of silent mismatched UI state.
    if (role) {
      const staffRoles = ['doctor', 'receptionist'];
      const selectedIsStaff = staffRoles.includes(role);
      const actualIsStaff = staffRoles.includes(user.role);

      if (selectedIsStaff !== actualIsStaff) {
        return sendError(
          res,
          `This account is registered as a ${user.role}. Please select "${actualIsStaff ? 'Doctor / Staff' : 'Patient'}" to sign in.`,
          401
        );
      }
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Firebase auth — login or register via Firebase ID token
 * @route   POST /api/auth/firebase
 * @access  Public
 */
exports.firebaseAuth = async (req, res, next) => {
  try {
    const { idToken, role = 'patient' } = req.body;
    
    if (!idToken) {
      return sendError(res, 'Firebase ID token is required', 400);
    }
    
    // Verify Firebase token
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      return sendError(res, 'Firebase authentication is not configured', 503);
    }
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, phone_number } = decodedToken;
    
    // Find or create user
    let user = await User.findOne({ firebaseUid: uid });
    
    if (!user && email) {
      user = await User.findOne({ email });
    }
    
    if (!user) {
      // Auto-register
      user = await User.create({
        firebaseUid: uid,
        name: name || 'User',
        email: email || `${uid}@firebase.local`,
        phone: phone_number || '',
        password: uid + Date.now(), // Random password (Firebase handles auth)
        role,
      });
    } else {
      // Update Firebase UID if missing
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        await user.save({ validateBeforeSave: false });
      }
    }
    
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    sendSuccess(res, user, 'Profile retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
exports.updateMe = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'avatar', 'dateOfBirth', 'gender', 'address', 'nic'];
    
    // Role-specific fields
    if (req.user.role === 'patient') {
      allowedFields.push('bloodType', 'allergies', 'emergencyContact', 'medicalHistory');
    }
    
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });
    
    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });
    
    sendSuccess(res, user, 'Profile updated');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update FCM token for push notifications
 * @route   PUT /api/auth/fcm-token
 * @access  Private
 */
exports.updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return sendError(res, 'FCM token is required', 400);
    }
    
    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    sendSuccess(res, null, 'FCM token updated');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect', 401);
    }
    
    user.password = newPassword;
    await user.save();
    
    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request a password reset email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 *
 * Issue #12 fix: the "Forgot password?" button previously just showed a
 * fake success toast and made no API call at all — there was no way to
 * actually recover a forgotten password. This generates a single-use,
 * time-limited reset token, stores only its hash, and emails the user a
 * link containing the raw token.
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 'Please provide an email address', 400);
    }

    const user = await User.findOne({ email });

    // Always return a generic success message, whether or not the email
    // exists — this avoids leaking which emails are registered.
    const genericMessage = 'If an account exists for that email, a password reset link has been sent.';

    if (!user) {
      return sendSuccess(res, null, genericMessage);
    }

    // Generate raw token (sent to user) and store only its hash.
    const rawToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${config.frontendUrl}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    sendSuccess(res, null, genericMessage);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using a token from the email link
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return sendError(res, 'Token and new password are required', 400);
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return sendError(res, 'Password reset link is invalid or has expired', 400);
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    sendSuccess(res, null, 'Password has been reset. You can now log in with your new password.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify a doctor or receptionist account (admin only)
 * @route   PUT /api/auth/verify/:userId
 * @access  Admin (X-Admin-Key header — see requireAdminKey middleware)
 *
 * Issue #10/#11 fix: this is the missing other half of the `isVerified`
 * flag. A clinic administrator confirms the doctor's medical license (or
 * the receptionist's employment) out-of-band, then calls this endpoint to
 * flip `isVerified` to true. Until then, `requireVerified` middleware
 * blocks the account from accessing queue/appointment/patient routes.
 */
exports.verifyUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (!['doctor', 'receptionist'].includes(user.role)) {
      return sendError(res, 'Only doctor and receptionist accounts require verification', 400);
    }

    user.isVerified = true;
    await user.save({ validateBeforeSave: false });

    sendSuccess(res, { _id: user._id, role: user.role, isVerified: user.isVerified }, 'Account verified');
  } catch (error) {
    next(error);
  }
};
