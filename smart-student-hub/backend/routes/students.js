const express = require('express');
const multer = require('multer');
const path = require('path');
const fsSync = require('fs');
const { auth, isStudent } = require('../middleware/auth');
const { getPool } = require('../config/database');

// Configure multer for resume uploads
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/resumes');
    if (!fsSync.existsSync(uploadPath)) {
      fsSync.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const resumeUpload = multer({
  storage: resumeStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'));
    }
  }
});

const router = express.Router();

// Get student dashboard data
router.get('/dashboard', auth, isStudent, async (req, res) => {
  try {
    const userId = req.user.userId;
    const pool = getPool();

    // Get student profile
    const studentResult = await pool.query(`
      SELECT s.*, u.first_name, u.last_name, u.email
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = $1
    `, [userId]);

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Student profile not found'
      });
    }

    const student = studentResult.rows[0];

    // Get activities count by status
    const activitiesResult = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM activities 
      WHERE student_id = $1
      GROUP BY status
    `, [student.id]);

    // Get recent activities
    const recentActivitiesResult = await pool.query(`
      SELECT 
        a.*,
        ac.name as category_name,
        u.first_name as approved_by_name
      FROM activities a
      LEFT JOIN activity_categories ac ON a.category = ac.name
      LEFT JOIN faculty f ON a.approved_by = f.id
      LEFT JOIN users u ON f.user_id = u.id
      WHERE a.student_id = $1
      ORDER BY a.created_at DESC
      LIMIT 10
    `, [student.id]);

    // Get portfolio info
    const portfolioResult = await pool.query(`
      SELECT * FROM portfolios 
      WHERE student_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [student.id]);

    res.json({
      message: 'Dashboard data retrieved successfully',
      data: {
        profile: student,
        activities: {
          byStatus: activitiesResult.rows,
          recent: recentActivitiesResult.rows
        },
        portfolio: portfolioResult.rows[0] || null
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving dashboard data'
    });
  }
});

// Get student activities
router.get('/activities', auth, isStudent, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, category, page = 1, limit = 10 } = req.query;
    const pool = getPool();

    // Get student ID
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [userId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Student profile not found'
      });
    }

    const studentId = studentResult.rows[0].id;

    // Build query
    let query = `
      SELECT 
        a.*,
        ac.name as category_name,
        u.first_name as approved_by_name,
        u.last_name as approved_by_last_name
      FROM activities a
      LEFT JOIN activity_categories ac ON a.category = ac.name
      LEFT JOIN faculty f ON a.approved_by = f.id
      LEFT JOIN users u ON f.user_id = u.id
      WHERE a.student_id = $1
    `;
    
    const queryParams = [studentId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND a.status = $${paramCount}`;
      queryParams.push(status);
    }

    if (category) {
      paramCount++;
      query += ` AND a.category = $${paramCount}`;
      queryParams.push(category);
    }

    query += ` ORDER BY a.created_at DESC`;

    // Add pagination
    const offset = (page - 1) * limit;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM activities WHERE student_id = $1';
    const countParams = [studentId];
    let countParamCount = 1;

    if (status) {
      countParamCount++;
      countQuery += ` AND status = $${countParamCount}`;
      countParams.push(status);
    }

    if (category) {
      countParamCount++;
      countQuery += ` AND category = $${countParamCount}`;
      countParams.push(category);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      message: 'Activities retrieved successfully',
      data: {
        activities: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Activities retrieval error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving activities'
    });
  }
});

// Get activity categories
router.get('/activity-categories', auth, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query(`
      SELECT * FROM activity_categories 
      WHERE is_active = true 
      ORDER BY name
    `);

    res.json({
      message: 'Activity categories retrieved successfully',
      data: result.rows
    });

  } catch (error) {
    console.error('Activity categories error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving activity categories'
    });
  }
});

// Get student statistics
router.get('/statistics', auth, isStudent, async (req, res) => {
  try {
    const userId = req.user.userId;
    const pool = getPool();

    // Get student ID
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [userId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Student profile not found'
      });
    }

    const studentId = studentResult.rows[0].id;

    // Get total activities
    const totalActivitiesResult = await pool.query(
      'SELECT COUNT(*) as total FROM activities WHERE student_id = $1',
      [studentId]
    );

    // Get approved activities
    const approvedActivitiesResult = await pool.query(
      'SELECT COUNT(*) as approved FROM activities WHERE student_id = $1 AND status = $2',
      [studentId, 'approved']
    );

    // Get pending activities
    const pendingActivitiesResult = await pool.query(
      'SELECT COUNT(*) as pending FROM activities WHERE student_id = $1 AND status = $2',
      [studentId, 'pending']
    );

    // Get activities by category
    const categoryStatsResult = await pool.query(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count
      FROM activities 
      WHERE student_id = $1
      GROUP BY category
      ORDER BY count DESC
    `, [studentId]);

    res.json({
      message: 'Statistics retrieved successfully',
      data: {
        totalActivities: parseInt(totalActivitiesResult.rows[0].total),
        approvedActivities: parseInt(approvedActivitiesResult.rows[0].approved),
        pendingActivities: parseInt(pendingActivitiesResult.rows[0].pending),
        categoryStats: categoryStatsResult.rows
      }
    });

  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving statistics'
    });
  }
});

// Get student profile by ID (public endpoint for viewing profiles)
router.get('/profile/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const pool = getPool();

    const result = await pool.query(`
      SELECT 
        s.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        s.student_id,
        s.department,
        s.year_of_study,
        s.description,
        s.tech_stack,
        s.skills,
        s.interests,
        s.career_goals,
        s.linkedin_url,
        s.github_url,
        s.portfolio_url,
        s.resume_url,
        u.created_at,
        COUNT(a.id) as total_activities,
        COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_activities,
        COALESCE(SUM(CASE WHEN a.status = 'approved' THEN ac.points ELSE 0 END), 0) as total_points
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN activities a ON s.id = a.student_id
      LEFT JOIN activity_categories ac ON a.category = ac.name
      WHERE s.id = $1
      GROUP BY s.id, u.first_name, u.last_name, u.email, u.phone, s.student_id, 
               s.department, s.year_of_study, s.description, s.tech_stack, s.skills,
               s.interests, s.career_goals, s.linkedin_url, s.github_url, 
               s.portfolio_url, s.resume_url, u.created_at
    `, [studentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Student profile not found'
      });
    }

    res.json({
      message: 'Student profile retrieved successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving profile'
    });
  }
});

// Get student portfolio (resume + approved activities)
router.get('/portfolio/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const pool = getPool();

    // Get student basic info and profile data
    const studentResult = await pool.query(`
      SELECT 
        s.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        s.student_id,
        s.department,
        s.year_of_study,
        s.description,
        s.tech_stack,
        s.skills,
        s.interests,
        s.career_goals,
        s.linkedin_url,
        s.github_url,
        s.portfolio_url,
        s.resume_url,
        u.created_at
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `, [studentId]);

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Student not found'
      });
    }

    const student = studentResult.rows[0];

    // Get all approved activities for this student
    const activitiesResult = await pool.query(`
      SELECT 
        a.id,
        a.title,
        a.description,
        a.activity_type,
        a.category,
        a.start_date,
        a.end_date,
        a.organization,
        a.certificate_url,
        a.status,
        a.created_at,
        a.approved_at,
        fu.first_name as approved_by_name,
        fu.last_name as approved_by_last_name,
        ac.name as category_name,
        ac.points
      FROM activities a
      LEFT JOIN faculty f ON a.approved_by = f.id
      LEFT JOIN users fu ON f.user_id = fu.id
      LEFT JOIN activity_categories ac ON a.category = ac.name
      WHERE a.student_id = $1 AND a.status = 'approved'
      ORDER BY a.approved_at DESC
    `, [studentId]);

    // Calculate total points from approved activities
    const totalPoints = activitiesResult.rows.reduce((sum, activity) => sum + (activity.points || 0), 0);

    // Prepare portfolio data
    const portfolioData = {
      ...student,
      activities: activitiesResult.rows,
      total_points: totalPoints,
      total_activities: activitiesResult.rows.length
    };

    res.json({
      message: 'Portfolio retrieved successfully',
      data: portfolioData
    });

  } catch (error) {
    console.error('Portfolio retrieval error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving portfolio'
    });
  }
});

// Update student profile
router.put('/profile/:studentId', auth, isStudent, resumeUpload.single('resume'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user.userId;
    const { firstName, lastName, phone, description, techStack, skills, interests, careerGoals, linkedinUrl, githubUrl, portfolioUrl } = req.body;
    const pool = getPool();

    // Verify the student owns this profile
    const studentCheck = await pool.query(
      'SELECT s.id FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = $1 AND u.id = $2',
      [studentId, userId]
    );

    if (studentCheck.rows.length === 0) {
      return res.status(403).json({
        message: 'Access denied. You can only edit your own profile.'
      });
    }

    // Handle resume upload if present
    let resumeUrl = null;
    if (req.file) {
      // Get current profile to potentially clean up old resume
      const currentProfile = await pool.query(
        'SELECT resume_url FROM students WHERE id = $1',
        [studentId]
      );
      
      const oldResumeUrl = currentProfile.rows[0]?.resume_url;
      resumeUrl = `/uploads/resumes/${req.file.filename}`;
      
      // Clean up old resume file if it exists and is different
      if (oldResumeUrl && oldResumeUrl !== resumeUrl) {
        const oldFilePath = path.join(__dirname, '..', 'uploads', 'resumes', path.basename(oldResumeUrl));
        try {
          const fs = require('fs').promises;
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.warn('Could not delete old resume:', err.message);
        }
      }
    }

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Update user basic info
      await pool.query(`
        UPDATE users 
        SET first_name = $1, last_name = $2, phone = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
      `, [firstName, lastName, phone, userId]);

      // Update student profile info
      let updateQuery, updateParams;
      
      if (resumeUrl) {
        // Update with new resume
        updateQuery = `
          UPDATE students 
          SET description = $1, tech_stack = $2, skills = $3, interests = $4, 
              career_goals = $5, linkedin_url = $6, github_url = $7, 
              portfolio_url = $8, resume_url = $9, updated_at = CURRENT_TIMESTAMP
          WHERE id = $10
        `;
        updateParams = [description, techStack, skills, interests, careerGoals, linkedinUrl, githubUrl, portfolioUrl, resumeUrl, studentId];
      } else {
        // Update without changing resume
        updateQuery = `
          UPDATE students 
          SET description = $1, tech_stack = $2, skills = $3, interests = $4, 
              career_goals = $5, linkedin_url = $6, github_url = $7, 
              portfolio_url = $8, updated_at = CURRENT_TIMESTAMP
          WHERE id = $9
        `;
        updateParams = [description, techStack, skills, interests, careerGoals, linkedinUrl, githubUrl, portfolioUrl, studentId];
      }

      await pool.query(updateQuery, updateParams);

      // Commit transaction
      await pool.query('COMMIT');

      res.json({
        message: 'Profile updated successfully'
      });

    } catch (error) {
      // Rollback transaction
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      message: 'Internal server error while updating profile'
    });
  }
});

// Complete student profile after registration
router.post('/complete-profile', resumeUpload.single('resume'), async (req, res) => {
  try {
    const { description, techStack, skills, interests, careerGoals, linkedinUrl, githubUrl, portfolioUrl, email } = req.body;
    const pool = getPool();

    // Find the student by email (temporary solution for profile completion)
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const userId = userResult.rows[0].id;

    // Find the student record
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [userId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Student profile not found'
      });
    }

    const studentId = studentResult.rows[0].id;

    // Handle resume upload if present
    let resumeUrl = null;
    if (req.file) {
      resumeUrl = `/uploads/resumes/${req.file.filename}`;
    }

    // Update student profile
    const updateResult = await pool.query(`
      UPDATE students 
      SET description = $1, tech_stack = $2, skills = $3, interests = $4, 
          career_goals = $5, linkedin_url = $6, github_url = $7, 
          portfolio_url = $8, resume_url = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `, [description, techStack, skills, interests, careerGoals, linkedinUrl, githubUrl, portfolioUrl, resumeUrl, studentId]);

    res.json({
      message: 'Profile completed successfully',
      data: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Profile completion error:', error);
    res.status(500).json({
      message: 'Internal server error while completing profile'
    });
  }
});

module.exports = router;
