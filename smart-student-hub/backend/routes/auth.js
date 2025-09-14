const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, phone, ...additionalData } = req.body;

    // Validate required fields
    if (!email || !password || !role || !firstName || !lastName) {
      return res.status(400).json({
        message: 'Please provide all required fields: email, password, role, firstName, lastName'
      });
    }

    // Validate role
    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be student, faculty, or admin'
      });
    }

    // Check if user already exists
    const pool = getPool();
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userResult = await pool.query(
      'INSERT INTO users (email, password, role, first_name, last_name, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, role, first_name, last_name, created_at',
      [email, hashedPassword, role, firstName, lastName, phone]
    );

    const user = userResult.rows[0];

    // Create role-specific profile
    if (role === 'student') {
      const { studentId, department, yearOfStudy } = additionalData;
      await pool.query(
        'INSERT INTO students (user_id, student_id, department, year_of_study) VALUES ($1, $2, $3, $4)',
        [user.id, studentId, department, yearOfStudy]
      );
    } else if (role === 'faculty') {
      const { employeeId, department, designation, specialization } = additionalData;
      await pool.query(
        'INSERT INTO faculty (user_id, employee_id, department, designation, specialization) VALUES ($1, $2, $3, $4, $5)',
        [user.id, employeeId, department, designation, specialization]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Internal server error during registration'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password'
      });
    }

    // Find user
    const pool = getPool();
    const userResult = await pool.query(
      'SELECT id, email, password, role, first_name, last_name, is_active FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Validate user type matches role (if userType is provided)
    if (userType && user.role !== userType) {
      return res.status(401).json({
        message: `This account is registered as ${user.role}, not ${userType}. Please select the correct account type.`
      });
    }

    // Get role-specific information
    let roleSpecificData = {};
    if (user.role === 'student') {
      const studentResult = await pool.query(
        'SELECT id, student_id FROM students WHERE user_id = $1',
        [user.id]
      );
      if (studentResult.rows.length > 0) {
        roleSpecificData = {
          studentId: studentResult.rows[0].id,
          studentNumber: studentResult.rows[0].student_id
        };
      }
    } else if (user.role === 'faculty') {
      const facultyResult = await pool.query(
        'SELECT id, employee_id, department, designation, specialization FROM faculty WHERE user_id = $1',
        [user.id]
      );
      if (facultyResult.rows.length > 0) {
        roleSpecificData = {
          facultyId: facultyResult.rows[0].id,
          employeeId: facultyResult.rows[0].employee_id,
          department: facultyResult.rows[0].department,
          designation: facultyResult.rows[0].designation,
          specialization: facultyResult.rows[0].specialization
        };
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        ...roleSpecificData
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Internal server error during login'
    });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let profileQuery;
    let profileParams = [userId];

    if (role === 'student') {
      profileQuery = `
        SELECT u.*, s.student_id, s.department, s.year_of_study, s.cgpa, s.attendance_percentage
        FROM users u
        LEFT JOIN students s ON u.id = s.user_id
        WHERE u.id = $1
      `;
    } else if (role === 'faculty') {
      profileQuery = `
        SELECT u.*, f.employee_id, f.department, f.designation, f.specialization
        FROM users u
        LEFT JOIN faculty f ON u.id = f.user_id
        WHERE u.id = $1
      `;
    } else {
      profileQuery = 'SELECT * FROM users WHERE id = $1';
    }

    const pool = getPool();
    const result = await pool.query(profileQuery, profileParams);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User profile not found'
      });
    }

    const profile = result.rows[0];
    
    // Remove password from response
    delete profile.password;

    res.json({
      message: 'Profile retrieved successfully',
      profile
    });

  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving profile'
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const { firstName, lastName, phone, ...additionalData } = req.body;

    // Update basic user info
    const pool = getPool();
    await pool.query(
      'UPDATE users SET first_name = $1, last_name = $2, phone = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
      [firstName, lastName, phone, userId]
    );

    // Update role-specific info
    if (role === 'student') {
      const { department, yearOfStudy, cgpa, attendancePercentage } = additionalData;
      await pool.query(
        'UPDATE students SET department = $1, year_of_study = $2, cgpa = $3, attendance_percentage = $4, updated_at = CURRENT_TIMESTAMP WHERE user_id = $5',
        [department, yearOfStudy, cgpa, attendancePercentage, userId]
      );
    } else if (role === 'faculty') {
      const { department, designation, specialization } = additionalData;
      await pool.query(
        'UPDATE faculty SET department = $1, designation = $2, specialization = $3, updated_at = CURRENT_TIMESTAMP WHERE user_id = $4',
        [department, designation, specialization, userId]
      );
    }

    res.json({
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      message: 'Internal server error while updating profile'
    });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Please provide current password and new password'
      });
    }

    // Get current password
    const pool = getPool();
    const userResult = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedNewPassword, userId]
    );

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      message: 'Internal server error while changing password'
    });
  }
});

module.exports = router;
