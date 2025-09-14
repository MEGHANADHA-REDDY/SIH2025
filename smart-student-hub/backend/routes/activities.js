const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, isStudent, isFaculty } = require('../middleware/auth');
const { getPool } = require('../config/database');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/certificates');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and Word documents are allowed'));
    }
  }
});

// Upload activity with certificate
router.post('/upload', auth, isStudent, upload.single('certificate'), async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      title,
      description,
      activityType,
      category,
      startDate,
      endDate,
      organization
    } = req.body;

    // Validate required fields
    if (!title || !activityType || !category) {
      return res.status(400).json({
        message: 'Please provide title, activity type, and category'
      });
    }

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

    // Prepare certificate URL
    let certificateUrl = null;
    if (req.file) {
      certificateUrl = `/uploads/certificates/${req.file.filename}`;
    }

    // Insert activity
    const result = await pool.query(`
      INSERT INTO activities (
        student_id, title, description, activity_type, category,
        start_date, end_date, organization, certificate_url, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      RETURNING *
    `, [
      studentId, title, description, activityType, category,
      startDate, endDate, organization, certificateUrl
    ]);

    res.status(201).json({
      message: 'Activity uploaded successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Activity upload error:', error);
    
    // Clean up uploaded file if database insert failed
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }

    res.status(500).json({
      message: 'Internal server error while uploading activity'
    });
  }
});

// Get all activities (for faculty/admin)
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, studentId, page = 1, limit = 10 } = req.query;

    // Build query
    let query = `
      SELECT 
        a.*,
        s.student_id,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        ac.name as category_name,
        f.first_name as approved_by_name,
        f.last_name as approved_by_last_name
      FROM activities a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN activity_categories ac ON a.category = ac.name
      LEFT JOIN faculty f ON a.approved_by = f.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;

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

    if (studentId) {
      paramCount++;
      query += ` AND a.student_id = $${paramCount}`;
      queryParams.push(studentId);
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
    let countQuery = `
      SELECT COUNT(*) FROM activities a
      JOIN students s ON a.student_id = s.id
      WHERE 1=1
    `;
    const countParams = [];
    let countParamCount = 0;

    if (status) {
      countParamCount++;
      countQuery += ` AND a.status = $${countParamCount}`;
      countParams.push(status);
    }

    if (category) {
      countParamCount++;
      countQuery += ` AND a.category = $${countParamCount}`;
      countParams.push(category);
    }

    if (studentId) {
      countParamCount++;
      countQuery += ` AND a.student_id = $${countParamCount}`;
      countParams.push(studentId);
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

// Approve/reject activity (faculty only)
router.put('/:id/approve', auth, isFaculty, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const facultyId = req.user.userId;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be either approved or rejected'
      });
    }

    // Get faculty ID from faculty table
    const facultyResult = await pool.query(
      'SELECT id FROM faculty WHERE user_id = $1',
      [facultyId]
    );

    if (facultyResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Faculty profile not found'
      });
    }

    const facultyDbId = facultyResult.rows[0].id;

    // Update activity
    const result = await pool.query(`
      UPDATE activities 
      SET status = $1, approved_by = $2, approved_at = CURRENT_TIMESTAMP, 
          rejection_reason = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [status, facultyDbId, rejectionReason, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Activity not found'
      });
    }

    res.json({
      message: `Activity ${status} successfully`,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Activity approval error:', error);
    res.status(500).json({
      message: 'Internal server error while updating activity status'
    });
  }
});

// Get activity by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        a.*,
        s.student_id,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        ac.name as category_name,
        f.first_name as approved_by_name,
        f.last_name as approved_by_last_name
      FROM activities a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN activity_categories ac ON a.category = ac.name
      LEFT JOIN faculty f ON a.approved_by = f.id
      WHERE a.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Activity not found'
      });
    }

    res.json({
      message: 'Activity retrieved successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Activity retrieval error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving activity'
    });
  }
});

// Update activity (student only)
router.put('/:id', auth, isStudent, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { title, description, activityType, category, startDate, endDate, organization } = req.body;

    // Check if activity belongs to student
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

    // Check if activity exists and belongs to student
    const activityResult = await pool.query(
      'SELECT id, status FROM activities WHERE id = $1 AND student_id = $2',
      [id, studentId]
    );

    if (activityResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Activity not found or access denied'
      });
    }

    // Only allow updates if activity is pending
    if (activityResult.rows[0].status !== 'pending') {
      return res.status(400).json({
        message: 'Cannot update activity that has been approved or rejected'
      });
    }

    // Update activity
    const result = await pool.query(`
      UPDATE activities 
      SET title = $1, description = $2, activity_type = $3, category = $4,
          start_date = $5, end_date = $6, organization = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 AND student_id = $9
      RETURNING *
    `, [title, description, activityType, category, startDate, endDate, organization, id, studentId]);

    res.json({
      message: 'Activity updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Activity update error:', error);
    res.status(500).json({
      message: 'Internal server error while updating activity'
    });
  }
});

// Delete activity (student only)
router.delete('/:id', auth, isStudent, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if activity belongs to student
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

    // Check if activity exists and belongs to student
    const activityResult = await pool.query(
      'SELECT id, status, certificate_url FROM activities WHERE id = $1 AND student_id = $2',
      [id, studentId]
    );

    if (activityResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Activity not found or access denied'
      });
    }

    // Only allow deletion if activity is pending
    if (activityResult.rows[0].status !== 'pending') {
      return res.status(400).json({
        message: 'Cannot delete activity that has been approved or rejected'
      });
    }

    // Delete activity
    await pool.query('DELETE FROM activities WHERE id = $1 AND student_id = $2', [id, studentId]);

    // Delete certificate file if exists
    if (activityResult.rows[0].certificate_url) {
      const filePath = path.join(__dirname, '..', activityResult.rows[0].certificate_url);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting certificate file:', err);
      });
    }

    res.json({
      message: 'Activity deleted successfully'
    });

  } catch (error) {
    console.error('Activity deletion error:', error);
    res.status(500).json({
      message: 'Internal server error while deleting activity'
    });
  }
});

module.exports = router;
