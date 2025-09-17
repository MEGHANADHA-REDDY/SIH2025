const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { auth, isStudent, isFaculty } = require('../middleware/auth');
const { getPool } = require('../config/database');
const { getActivityDataForWebhook } = require('./webhook');
const builtinSheetsService = require('../services/builtinSheets');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save certificates and images in different subfolders
    const isImage = /image\/(jpeg|jpg|png)/.test(file.mimetype);
    const subfolder = isImage && file.fieldname === 'image' ? 'activity-images' : 'certificates';
    const uploadPath = path.join(__dirname, `../uploads/${subfolder}`);
    if (!fsSync.existsSync(uploadPath)) {
      fsSync.mkdirSync(uploadPath, { recursive: true });
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

// Upload activity with certificate and optional image
router.post('/upload', auth, isStudent, upload.fields([
  { name: 'certificate', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      title,
      description,
      activityType,
      category,
      startDate,
      endDate,
      organization,
      githubUrl
    } = req.body;

    // Validate required fields
    if (!title || !activityType || !category) {
      return res.status(400).json({
        message: 'Please provide title, activity type, and category'
      });
    }

    // Get student ID
    const pool = getPool();
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

    // Prepare file URLs
    let certificateUrl = null;
    let imageUrl = null;
    if (req.files && req.files['certificate'] && req.files['certificate'][0]) {
      certificateUrl = `/uploads/certificates/${req.files['certificate'][0].filename}`;
    }
    if (req.files && req.files['image'] && req.files['image'][0]) {
      imageUrl = `/uploads/activity-images/${req.files['image'][0].filename}`;
    }

    // Insert activity
    const result = await pool.query(`
      INSERT INTO activities (
        student_id, title, description, activity_type, category,
        start_date, end_date, organization, certificate_url, image_url, github_url, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
      RETURNING *
    `, [
      studentId, title, description, activityType, category,
      startDate, endDate, organization, certificateUrl, imageUrl, githubUrl || null
    ]);

    res.status(201).json({
      message: 'Activity uploaded successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Activity upload error:', error);
    
    // Clean up uploaded files if database insert failed
    if (req.files) {
      const allFiles = [...(req.files['certificate'] || []), ...(req.files['image'] || [])];
      allFiles.forEach((f) => {
        fs.unlink(f.path, (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });
      })
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
    const pool = getPool();

    // Build query
    let query = `
      SELECT 
        a.*,
        s.student_id,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        ac.name as category_name,
        fu.first_name as approved_by_name,
        fu.last_name as approved_by_last_name
      FROM activities a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN activity_categories ac ON a.category = ac.name
      LEFT JOIN faculty f ON a.approved_by = f.id
      LEFT JOIN users fu ON f.user_id = fu.id
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
    const { action, status, rejectionReason } = req.body;
    const facultyId = req.user.userId;
    const pool = getPool();

    // Handle both new format (action) and old format (status) for compatibility
    const finalStatus = action || status;

    // Validate status
    if (!['approve', 'approved', 'reject', 'rejected'].includes(finalStatus)) {
      return res.status(400).json({
        message: 'Action must be either approve or reject'
      });
    }

    // Normalize status
    const normalizedStatus = finalStatus === 'approve' ? 'approved' : finalStatus === 'reject' ? 'rejected' : finalStatus;

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
    `, [normalizedStatus, facultyDbId, rejectionReason, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Activity not found'
      });
    }

    // Trigger webhook for Google Sheets integration
    try {
      console.log(`🔄 Triggering webhook for activity ${id} with status ${normalizedStatus}`);
      
      // Get activity data for webhook
      const webhookData = await getActivityDataForWebhook(id);
      
      // Send data to built-in sheets
      await builtinSheetsService.addActivityToSheet(webhookData);
      
      console.log(`✅ Successfully updated built-in sheet for activity ${id}`);
    } catch (webhookError) {
      console.error('❌ Webhook trigger failed:', webhookError.message);
      // Don't fail the main request if webhook fails
      // Log the error but continue with the response
    }

    res.json({
      message: `Activity ${normalizedStatus} successfully`,
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
    const pool = getPool();

    const result = await pool.query(`
      SELECT 
        a.*,
        s.student_id,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        ac.name as category_name,
        fu.first_name as approved_by_name,
        fu.last_name as approved_by_last_name
      FROM activities a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN activity_categories ac ON a.category = ac.name
      LEFT JOIN faculty f ON a.approved_by = f.id
      LEFT JOIN users fu ON f.user_id = fu.id
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
router.put('/:id', auth, isStudent, upload.single('certificate'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { title, description, activityType, category, startDate, endDate, organization, githubUrl } = req.body;
    const pool = getPool();

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

    // Handle certificate update if new file is provided
    let certificateUrl = null;
    if (req.file) {
      // Get current activity to potentially clean up old certificate
      const currentActivity = await pool.query(
        'SELECT certificate_url FROM activities WHERE id = $1',
        [id]
      );
      
      const oldCertificateUrl = currentActivity.rows[0]?.certificate_url;
      
      // Set new certificate URL
      certificateUrl = `/uploads/${req.file.filename}`;
      
      // Clean up old certificate file if it exists and is different
      if (oldCertificateUrl && oldCertificateUrl !== certificateUrl) {
        const oldFilePath = path.join(__dirname, '..', 'uploads', path.basename(oldCertificateUrl));
        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.warn('Could not delete old certificate:', err.message);
        }
      }
    }

    // Update activity (with or without certificate)
    let updateQuery, updateParams;
    
    if (certificateUrl) {
      // Update with new certificate
      updateQuery = `
        UPDATE activities 
        SET title = $1, description = $2, activity_type = $3, category = $4,
            start_date = $5, end_date = $6, organization = $7, github_url = $8, certificate_url = $9, updated_at = CURRENT_TIMESTAMP
        WHERE id = $10 AND student_id = $11
        RETURNING *
      `;
      updateParams = [title, description, activityType, category, startDate, endDate, organization, githubUrl || null, certificateUrl, id, studentId];
    } else {
      // Update without changing certificate
      updateQuery = `
        UPDATE activities 
        SET title = $1, description = $2, activity_type = $3, category = $4,
            start_date = $5, end_date = $6, organization = $7, github_url = $8, updated_at = CURRENT_TIMESTAMP
        WHERE id = $9 AND student_id = $10
        RETURNING *
      `;
      updateParams = [title, description, activityType, category, startDate, endDate, organization, githubUrl || null, id, studentId];
    }

    const result = await pool.query(updateQuery, updateParams);

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
    const pool = getPool();

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
