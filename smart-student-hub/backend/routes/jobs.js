const express = require('express');
const { getPool } = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all active job postings (Students can view)
router.get('/active', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query(`
      SELECT jp.id, jp.title, jp.description, jp.company, jp.location, jp.job_type, 
             jp.salary_range, jp.requirements, jp.benefits, jp.application_deadline, jp.created_at,
             r.company as recruiter_company, r.designation as recruiter_designation
      FROM job_postings jp
      JOIN recruiters r ON jp.recruiter_id = r.id
      WHERE jp.is_active = true AND (jp.application_deadline IS NULL OR jp.application_deadline > CURRENT_DATE)
      ORDER BY jp.created_at DESC
    `);

    res.json({
      message: 'Active job postings retrieved successfully',
      jobPostings: result.rows
    });

  } catch (error) {
    console.error('Job postings retrieval error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving job postings'
    });
  }
});

// Get recruiter's job postings
router.get('/recruiter-postings', auth, async (req, res) => {
  try {
    // Check if user is a recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        message: 'Only recruiters can access this endpoint'
      });
    }

    const pool = getPool();

    // Get recruiter ID
    const recruiterResult = await pool.query(
      'SELECT id FROM recruiters WHERE user_id = $1',
      [req.user.userId]
    );

    if (recruiterResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Recruiter profile not found'
      });
    }

    const recruiterId = recruiterResult.rows[0].id;

    // Get recruiter's job postings
    const result = await pool.query(`
      SELECT id, title, company, location, job_type, salary_range, application_deadline, is_active, created_at
      FROM job_postings 
      WHERE recruiter_id = $1
      ORDER BY created_at DESC
    `, [recruiterId]);

    res.json({
      message: 'Recruiter job postings retrieved successfully',
      data: result.rows
    });

  } catch (error) {
    console.error('Recruiter job postings error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving recruiter job postings'
    });
  }
});

// Get applications for a specific job posting
router.get('/applications/:jobId', auth, async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if user is a recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        message: 'Only recruiters can access this endpoint'
      });
    }

    const pool = getPool();

    // Get recruiter ID
    const recruiterResult = await pool.query(
      'SELECT id FROM recruiters WHERE user_id = $1',
      [req.user.userId]
    );

    if (recruiterResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Recruiter profile not found'
      });
    }

    const recruiterId = recruiterResult.rows[0].id;

    // Verify that the job posting belongs to this recruiter
    const jobResult = await pool.query(
      'SELECT id FROM job_postings WHERE id = $1 AND recruiter_id = $2',
      [jobId, recruiterId]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Job posting not found or you do not have permission to view its applications'
      });
    }

    // Get applications for this job posting
    const result = await pool.query(`
      SELECT 
        ja.id,
        jp.title as job_title,
        jp.company,
        s.student_id,
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        u.email as student_email,
        s.department as student_department,
        s.year_of_study as student_year,
        s.cgpa as student_cgpa,
        ja.cover_letter,
        ja.resume_url,
        ja.status,
        ja.applied_at,
        ja.updated_at
      FROM job_applications ja
      JOIN job_postings jp ON ja.job_posting_id = jp.id
      JOIN students s ON ja.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE ja.job_posting_id = $1
      ORDER BY ja.applied_at DESC
    `, [jobId]);

    res.json({
      message: 'Job applications retrieved successfully',
      data: result.rows
    });

  } catch (error) {
    console.error('Job applications error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving job applications'
    });
  }
});

// Update application status
router.put('/update-application-status', auth, async (req, res) => {
  try {
    const { applicationId, status } = req.body;

    // Check if user is a recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        message: 'Only recruiters can update application status'
      });
    }

    // Validate status
    const validStatuses = ['applied', 'reviewed', 'shortlisted', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const pool = getPool();

    // Get recruiter ID
    const recruiterResult = await pool.query(
      'SELECT id FROM recruiters WHERE user_id = $1',
      [req.user.userId]
    );

    if (recruiterResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Recruiter profile not found'
      });
    }

    const recruiterId = recruiterResult.rows[0].id;

    // Check if application exists and belongs to recruiter's job posting
    const applicationResult = await pool.query(`
      SELECT ja.id, jp.title, jp.company
      FROM job_applications ja
      JOIN job_postings jp ON ja.job_posting_id = jp.id
      WHERE ja.id = $1 AND jp.recruiter_id = $2
    `, [applicationId, recruiterId]);

    if (applicationResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Application not found or you do not have permission to update it'
      });
    }

    // Update application status
    const updateResult = await pool.query(
      'UPDATE job_applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status',
      [status, applicationId]
    );

    res.json({
      message: 'Application status updated successfully',
      application: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Application status update error:', error);
    res.status(500).json({
      message: 'Internal server error while updating application status'
    });
  }
});

// Get job posting details (Students can view)
router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const pool = getPool();

    const result = await pool.query(`
      SELECT jp.id, jp.title, jp.description, jp.company, jp.location, jp.job_type, 
             jp.salary_range, jp.requirements, jp.benefits, jp.application_deadline, jp.created_at,
             r.company as recruiter_company, r.designation as recruiter_designation
      FROM job_postings jp
      JOIN recruiters r ON jp.recruiter_id = r.id
      WHERE jp.id = $1 AND jp.is_active = true
    `, [jobId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Job posting not found'
      });
    }

    res.json({
      message: 'Job posting retrieved successfully',
      jobPosting: result.rows[0]
    });

  } catch (error) {
    console.error('Job posting retrieval error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving job posting'
    });
  }
});

// Apply for a job (Students only)
router.post('/:jobId/apply', auth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter, resumeUrl } = req.body;

    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        message: 'Only students can apply for jobs'
      });
    }

    const pool = getPool();

    // Get student ID
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user.userId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Student profile not found'
      });
    }

    const studentId = studentResult.rows[0].id;

    // Check if job posting exists and is active
    const jobResult = await pool.query(
      'SELECT id, application_deadline FROM job_postings WHERE id = $1 AND is_active = true',
      [jobId]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Job posting not found or inactive'
      });
    }

    const job = jobResult.rows[0];

    // Check if application deadline has passed
    if (job.application_deadline && new Date(job.application_deadline) < new Date()) {
      return res.status(400).json({
        message: 'Application deadline has passed'
      });
    }

    // Check if student has already applied
    const existingApplication = await pool.query(
      'SELECT id FROM job_applications WHERE job_posting_id = $1 AND student_id = $2',
      [jobId, studentId]
    );

    if (existingApplication.rows.length > 0) {
      return res.status(400).json({
        message: 'You have already applied for this job'
      });
    }

    // Create job application
    const applicationResult = await pool.query(
      'INSERT INTO job_applications (job_posting_id, student_id, cover_letter, resume_url) VALUES ($1, $2, $3, $4) RETURNING id, applied_at',
      [jobId, studentId, coverLetter, resumeUrl]
    );

    res.status(201).json({
      message: 'Job application submitted successfully',
      application: applicationResult.rows[0]
    });

  } catch (error) {
    console.error('Job application error:', error);
    res.status(500).json({
      message: 'Internal server error during job application'
    });
  }
});

// Get student's job applications
router.get('/my-applications', auth, async (req, res) => {
  try {
    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        message: 'Only students can view their applications'
      });
    }

    const pool = getPool();

    // Get student ID
    const studentResult = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user.userId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Student profile not found'
      });
    }

    const studentId = studentResult.rows[0].id;

    // Get student's applications
    const result = await pool.query(`
      SELECT ja.id, ja.cover_letter, ja.resume_url, ja.status, ja.applied_at,
             jp.title, jp.company, jp.location, jp.job_type, jp.salary_range,
             r.company as recruiter_company
      FROM job_applications ja
      JOIN job_postings jp ON ja.job_posting_id = jp.id
      JOIN recruiters r ON jp.recruiter_id = r.id
      WHERE ja.student_id = $1
      ORDER BY ja.applied_at DESC
    `, [studentId]);

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

// Update application status (Recruiter only)
router.put('/applications/:applicationId/status', auth, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    // Check if user is a recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        message: 'Only recruiters can update application status'
      });
    }

    // Validate status
    const validStatuses = ['applied', 'reviewed', 'shortlisted', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const pool = getPool();

    // Check if application exists and belongs to recruiter's job posting
    const applicationResult = await pool.query(`
      SELECT ja.id, jp.title, jp.company
      FROM job_applications ja
      JOIN job_postings jp ON ja.job_posting_id = jp.id
      JOIN recruiters r ON jp.recruiter_id = r.id
      WHERE ja.id = $1 AND r.user_id = $2
    `, [applicationId, req.user.userId]);

    if (applicationResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Application not found or you do not have permission to update it'
      });
    }

    // Update application status
    await pool.query(
      'UPDATE job_applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, applicationId]
    );

    res.json({
      message: 'Application status updated successfully',
      application: {
        id: applicationId,
        status: status,
        jobTitle: applicationResult.rows[0].title,
        company: applicationResult.rows[0].company
      }
    });

  } catch (error) {
    console.error('Application status update error:', error);
    res.status(500).json({
      message: 'Internal server error while updating application status'
    });
  }
});

// Get recruiter's job postings and applications
router.get('/recruiter/dashboard', auth, async (req, res) => {
  try {
    // Check if user is a recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        message: 'Only recruiters can access this dashboard'
      });
    }

    const pool = getPool();

    // Get recruiter ID
    const recruiterResult = await pool.query(
      'SELECT id FROM recruiters WHERE user_id = $1',
      [req.user.userId]
    );

    if (recruiterResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Recruiter profile not found'
      });
    }

    const recruiterId = recruiterResult.rows[0].id;

    // Get recruiter's job postings with application counts
    const jobPostingsResult = await pool.query(`
      SELECT jp.id, jp.title, jp.company, jp.location, jp.job_type, jp.is_active, jp.created_at,
             COUNT(ja.id) as application_count
      FROM job_postings jp
      LEFT JOIN job_applications ja ON jp.id = ja.job_posting_id
      WHERE jp.recruiter_id = $1
      GROUP BY jp.id, jp.title, jp.company, jp.location, jp.job_type, jp.is_active, jp.created_at
      ORDER BY jp.created_at DESC
    `, [recruiterId]);

    // Get recent applications
    const applicationsResult = await pool.query(`
      SELECT ja.id, ja.status, ja.applied_at,
             u.first_name, u.last_name, u.email,
             s.student_id, s.department, s.year_of_study,
             jp.title as job_title, jp.company
      FROM job_applications ja
      JOIN students s ON ja.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN job_postings jp ON ja.job_posting_id = jp.id
      WHERE jp.recruiter_id = $1
      ORDER BY ja.applied_at DESC
      LIMIT 10
    `, [recruiterId]);

    res.json({
      message: 'Recruiter dashboard data retrieved successfully',
      jobPostings: jobPostingsResult.rows,
      recentApplications: applicationsResult.rows
    });

  } catch (error) {
    console.error('Recruiter dashboard error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving recruiter dashboard'
    });
  }
});

// Get student profile for recruiter (with application context)
router.get('/student-profile/:studentId/:applicationId', auth, async (req, res) => {
  try {
    const { studentId, applicationId } = req.params;

    // Check if user is a recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        message: 'Only recruiters can access this endpoint'
      });
    }

    const pool = getPool();

    // Get recruiter ID
    const recruiterResult = await pool.query(
      'SELECT id FROM recruiters WHERE user_id = $1',
      [req.user.userId]
    );

    if (recruiterResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Recruiter profile not found'
      });
    }

    const recruiterId = recruiterResult.rows[0].id;

    // Verify that the application belongs to recruiter's job posting and get student info
    const applicationResult = await pool.query(`
      SELECT 
        ja.id,
        ja.cover_letter,
        ja.resume_url,
        ja.status,
        ja.applied_at,
        jp.title as job_title,
        jp.company,
        jp.id as job_posting_id,
        s.id as student_db_id,
        s.student_id
      FROM job_applications ja
      JOIN job_postings jp ON ja.job_posting_id = jp.id
      JOIN students s ON ja.student_id = s.id
      WHERE ja.id = $1 AND s.student_id = $2 AND jp.recruiter_id = $3
    `, [applicationId, studentId, recruiterId]);

    if (applicationResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Application not found or you do not have permission to view this student profile'
      });
    }

    const application = applicationResult.rows[0];
    const studentDbId = application.student_db_id;

    // Get complete student profile using the database ID
    const studentResult = await pool.query(`
      SELECT 
        s.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `, [studentDbId]);

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Student profile not found'
      });
    }

    const student = studentResult.rows[0];

    res.json({
      message: 'Student profile retrieved successfully',
      data: {
        application: application,
        student: student
      }
    });

  } catch (error) {
    console.error('Student profile retrieval error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving student profile'
    });
  }
});

module.exports = router;
