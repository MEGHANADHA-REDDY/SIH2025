const express = require('express');
const bcrypt = require('bcryptjs');
const { getPool } = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user is super admin
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      message: 'Access denied. Super admin privileges required.'
    });
  }
  next();
};

// Middleware to check if user is admin or super admin
const requireAdmin = (req, res, next) => {
  if (!['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Create student account (Super Admin only)
router.post('/create-student', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, studentId, department, yearOfStudy } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !studentId || !department) {
      return res.status(400).json({
        message: 'Please provide all required fields: firstName, lastName, email, studentId, department'
      });
    }

    const pool = getPool();

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR EXISTS (SELECT 1 FROM students WHERE student_id = $2)',
      [email, studentId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: 'User with this email or student ID already exists'
      });
    }

    // Default password for students
    const defaultPassword = 'abcd@1234';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    // Create user
    const userResult = await pool.query(
      'INSERT INTO users (email, password, role, first_name, last_name, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, role, first_name, last_name, created_at',
      [email, hashedPassword, 'student', firstName, lastName, phone]
    );

    const user = userResult.rows[0];

    // Create student profile
    await pool.query(
      'INSERT INTO students (user_id, student_id, department, year_of_study) VALUES ($1, $2, $3, $4)',
      [user.id, studentId, department, yearOfStudy]
    );

    res.status(201).json({
      message: 'Student account created successfully',
      credentials: {
        username: studentId,
        password: defaultPassword
      },
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        studentId: studentId,
        department: department
      }
    });

  } catch (error) {
    console.error('Student creation error:', error);
    res.status(500).json({
      message: 'Internal server error during student creation'
    });
  }
});

// Create faculty account (Super Admin only)
router.post('/create-faculty', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, employeeId, department, designation, specialization } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !employeeId || !department) {
      return res.status(400).json({
        message: 'Please provide all required fields: firstName, lastName, email, employeeId, department'
      });
    }

    const pool = getPool();

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR EXISTS (SELECT 1 FROM faculty WHERE employee_id = $2)',
      [email, employeeId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: 'User with this email or employee ID already exists'
      });
    }

    // Default password for faculty
    const defaultPassword = 'abcd@1234';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    // Create user
    const userResult = await pool.query(
      'INSERT INTO users (email, password, role, first_name, last_name, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, role, first_name, last_name, created_at',
      [email, hashedPassword, 'faculty', firstName, lastName, phone]
    );

    const user = userResult.rows[0];

    // Create faculty profile
    await pool.query(
      'INSERT INTO faculty (user_id, employee_id, department, designation, specialization) VALUES ($1, $2, $3, $4, $5)',
      [user.id, employeeId, department, designation, specialization]
    );

    res.status(201).json({
      message: 'Faculty account created successfully',
      credentials: {
        username: employeeId,
        password: defaultPassword
      },
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        employeeId: employeeId,
        department: department
      }
    });

  } catch (error) {
    console.error('Faculty creation error:', error);
    res.status(500).json({
      message: 'Internal server error during faculty creation'
    });
  }
});

// Create recruiter account (Admin only)
router.post('/create-recruiter', auth, requireAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, company, designation, industry } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !company) {
      return res.status(400).json({
        message: 'Please provide all required fields: firstName, lastName, email, company'
      });
    }

    const pool = getPool();

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    // Generate random password for recruiter
    const randomPassword = Math.random().toString(36).slice(-8) + '@123';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);

    // Create user
    const userResult = await pool.query(
      'INSERT INTO users (email, password, role, first_name, last_name, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, role, first_name, last_name, created_at',
      [email, hashedPassword, 'recruiter', firstName, lastName, phone]
    );

    const user = userResult.rows[0];

    // Create recruiter profile
    const recruiterResult = await pool.query(
      'INSERT INTO recruiters (user_id, company, designation, industry) VALUES ($1, $2, $3, $4) RETURNING id',
      [user.id, company, designation, industry]
    );

    res.status(201).json({
      message: 'Recruiter account created successfully',
      credentials: {
        username: email,
        password: randomPassword
      },
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        company: company,
        recruiterId: recruiterResult.rows[0].id
      }
    });

  } catch (error) {
    console.error('Recruiter creation error:', error);
    res.status(500).json({
      message: 'Internal server error during recruiter creation'
    });
  }
});

// Create job posting (Admin only)
router.post('/create-job-posting', auth, requireAdmin, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      company, 
      location, 
      jobType, 
      salaryRange, 
      requirements, 
      benefits, 
      applicationDeadline
    } = req.body;

    // Validate required fields
    if (!title || !description || !company) {
      return res.status(400).json({
        message: 'Please provide all required fields: title, description, company'
      });
    }

    const pool = getPool();

    // Check if recruiter already exists for this company
    let recruiterResult = await pool.query(
      'SELECT id FROM recruiters WHERE company = $1',
      [company]
    );

    let recruiterId;
    let recruiterCreated = false;
    let recruiterCredentials = null;

    if (recruiterResult.rows.length === 0) {
      // Create new recruiter account for this company
      const recruiterEmail = `${company.toLowerCase().replace(/\s+/g, '')}@recruiter.com`;
      const recruiterPassword = 'recruiter123';
      
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(recruiterPassword, saltRounds);

      // Create user account
      const userResult = await pool.query(
        'INSERT INTO users (email, password, role, first_name, last_name, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [recruiterEmail, hashedPassword, 'recruiter', 'Company', 'Recruiter', '+1-555-0000']
      );

      const userId = userResult.rows[0].id;

      // Create recruiter profile
      const newRecruiterResult = await pool.query(
        'INSERT INTO recruiters (user_id, company, designation, industry) VALUES ($1, $2, $3, $4) RETURNING id',
        [userId, company, 'HR Manager', 'Technology']
      );

      recruiterId = newRecruiterResult.rows[0].id;
      recruiterCreated = true;
      recruiterCredentials = {
        username: recruiterEmail,
        password: recruiterPassword
      };
    } else {
      recruiterId = recruiterResult.rows[0].id;
    }

    // Create job posting
    const jobResult = await pool.query(
      `INSERT INTO job_postings 
       (admin_id, recruiter_id, title, description, company, location, job_type, salary_range, requirements, benefits, application_deadline) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING id, title, company, created_at`,
      [req.user.userId, recruiterId, title, description, company, location, jobType, salaryRange, requirements, benefits, applicationDeadline]
    );

    const response = {
      message: 'Job posting created successfully',
      job: jobResult.rows[0],
      recruiterCreated,
      recruiterCredentials
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Job posting creation error:', error);
    res.status(500).json({
      message: 'Internal server error during job posting creation'
    });
  }
});

// Get all students (Super Admin only)
router.get('/students', auth, requireSuperAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query(`
      SELECT u.id as user_id, u.email, u.first_name, u.last_name, u.phone, u.is_active, u.created_at,
             s.id, s.student_id, s.department, s.year_of_study, s.cgpa, s.attendance_percentage
      FROM users u
      JOIN students s ON u.id = s.user_id
      ORDER BY u.created_at DESC
    `);

    res.json({
      message: 'Students retrieved successfully',
      students: result.rows
    });

  } catch (error) {
    console.error('Students retrieval error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving students'
    });
  }
});

// Get all faculty (Super Admin only)
router.get('/faculty', auth, requireSuperAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active, u.created_at,
             f.employee_id, f.department, f.designation, f.specialization
      FROM users u
      JOIN faculty f ON u.id = f.user_id
      ORDER BY u.created_at DESC
    `);

    res.json({
      message: 'Faculty retrieved successfully',
      faculty: result.rows
    });

  } catch (error) {
    console.error('Faculty retrieval error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving faculty'
    });
  }
});

// Get all recruiters (Admin only)
router.get('/recruiters', auth, requireAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active, u.created_at,
             r.company, r.designation, r.industry
      FROM users u
      JOIN recruiters r ON u.id = r.user_id
      ORDER BY u.created_at DESC
    `);

    res.json({
      message: 'Recruiters retrieved successfully',
      recruiters: result.rows
    });

  } catch (error) {
    console.error('Recruiters retrieval error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving recruiters'
    });
  }
});

// Get job postings (Admin only)
router.get('/job-postings', auth, requireAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query(`
      SELECT jp.id, jp.title, jp.description, jp.company, jp.location, jp.job_type, 
             jp.salary_range, jp.application_deadline, jp.is_active, jp.created_at,
             u.first_name, u.last_name as admin_name,
             r.company as recruiter_company, r.designation as recruiter_designation
      FROM job_postings jp
      JOIN users u ON jp.admin_id = u.id
      JOIN recruiters r ON jp.recruiter_id = r.id
      ORDER BY jp.created_at DESC
    `);

    res.json({
      message: 'Job postings retrieved successfully',
      jobPostings: result.rows
    });

  } catch (error) {
    console.error('Job postings retrieval error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving job postings'
    });
  }
});

// Get job applications for a specific job posting (Admin/Recruiter)
router.get('/job-applications/:jobId', auth, requireAdmin, async (req, res) => {
  try {
    const { jobId } = req.params;
    const pool = getPool();

    const result = await pool.query(`
      SELECT ja.id, ja.cover_letter, ja.resume_url, ja.status, ja.applied_at,
             u.first_name, u.last_name, u.email,
             s.student_id, s.department, s.year_of_study, s.cgpa,
             jp.title as job_title, jp.company
      FROM job_applications ja
      JOIN students s ON ja.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN job_postings jp ON ja.job_posting_id = jp.id
      WHERE ja.job_posting_id = $1
      ORDER BY ja.applied_at DESC
    `, [jobId]);

    res.json({
      message: 'Job applications retrieved successfully',
      applications: result.rows
    });

  } catch (error) {
    console.error('Job applications retrieval error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving job applications'
    });
  }
});

module.exports = router;
