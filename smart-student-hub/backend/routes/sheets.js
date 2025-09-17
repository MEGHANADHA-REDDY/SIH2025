const express = require('express');
const { auth, isStudent, isFaculty, isAdmin } = require('../middleware/auth');
const builtinSheetsService = require('../services/builtinSheets');
const { getPool } = require('../config/database');

const router = express.Router();

/**
 * Get student's own sheet data (student only)
 */
router.get('/my-sheet', auth, isStudent, async (req, res) => {
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
        success: false,
        message: 'Student profile not found'
      });
    }

    const studentDbId = studentResult.rows[0].id;
    const sheetData = await builtinSheetsService.getSheetData(studentDbId);

    if (!sheetData) {
      // Create empty sheet if none exists
      const newSheet = await builtinSheetsService.getStudentSheet(studentDbId);
      const emptySheetData = await builtinSheetsService.getSheetData(studentDbId);
      
      return res.json({
        success: true,
        message: 'Sheet created successfully',
        data: emptySheetData
      });
    }

    res.json({
      success: true,
      message: 'Sheet data retrieved successfully',
      data: sheetData
    });

  } catch (error) {
    console.error('❌ Error getting student sheet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving sheet data'
    });
  }
});

/**
 * Get sheet data by share token (public access)
 */
router.get('/shared/:shareToken', async (req, res) => {
  try {
    const { shareToken } = req.params;
    
    const sheetData = await builtinSheetsService.getSheetByShareToken(shareToken);

    if (!sheetData) {
      return res.status(404).json({
        success: false,
        message: 'Sheet not found or invalid share token'
      });
    }

    res.json({
      success: true,
      message: 'Shared sheet data retrieved successfully',
      data: sheetData
    });

  } catch (error) {
    console.error('❌ Error getting shared sheet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving shared sheet'
    });
  }
});

/**
 * Get specific student's sheet (faculty/admin only)
 */
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userRole = req.user.role;

    // Check permissions - allow faculty, admin, and recruiters
    if (!['faculty', 'admin', 'super_admin', 'recruiter'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Faculty, admin, or recruiter role required.'
      });
    }

    const sheetData = await builtinSheetsService.getSheetData(parseInt(studentId));

    if (!sheetData) {
      return res.status(404).json({
        success: false,
        message: 'Student sheet not found'
      });
    }

    res.json({
      success: true,
      message: 'Student sheet data retrieved successfully',
      data: sheetData
    });

  } catch (error) {
    console.error('❌ Error getting student sheet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving student sheet'
    });
  }
});

/**
 * Get all sheets (admin only)
 */
router.get('/all', auth, isAdmin, async (req, res) => {
  try {
    const sheets = await builtinSheetsService.getAllSheets();

    res.json({
      success: true,
      message: 'All sheets retrieved successfully',
      data: {
        sheets,
        total: sheets.length
      }
    });

  } catch (error) {
    console.error('❌ Error getting all sheets:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving sheets'
    });
  }
});

/**
 * Regenerate share token for student's sheet (student only)
 */
router.post('/regenerate-token', auth, isStudent, async (req, res) => {
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
        success: false,
        message: 'Student profile not found'
      });
    }

    const studentDbId = studentResult.rows[0].id;
    const updatedSheet = await builtinSheetsService.regenerateShareToken(studentDbId);

    res.json({
      success: true,
      message: 'Share token regenerated successfully',
      data: {
        share_token: updatedSheet.share_token,
        share_url: `${req.protocol}://${req.get('host')}/api/sheets/shared/${updatedSheet.share_token}`
      }
    });

  } catch (error) {
    console.error('❌ Error regenerating share token:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while regenerating share token'
    });
  }
});

/**
 * Get share URL for student's sheet (student only)
 */
router.get('/share-url', auth, isStudent, async (req, res) => {
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
        success: false,
        message: 'Student profile not found'
      });
    }

    const studentDbId = studentResult.rows[0].id;
    
    // Get or create sheet
    const sheet = await builtinSheetsService.getStudentSheet(studentDbId);
    
    res.json({
      success: true,
      message: 'Share URL retrieved successfully',
      data: {
        share_token: sheet.share_token,
        share_url: `${req.protocol}://${req.get('host')}/api/sheets/shared/${sheet.share_token}`,
        web_url: `${req.protocol}://${req.get('host').replace(':5000', ':3000')}/sheet/${sheet.share_token}`
      }
    });

  } catch (error) {
    console.error('❌ Error getting share URL:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while getting share URL'
    });
  }
});

/**
 * Get sheet statistics (admin only)
 */
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const pool = getPool();
    
    // Get overall statistics
    const statsResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT ss.id) as total_sheets,
        COUNT(sse.id) as total_entries,
        COUNT(CASE WHEN sse.status = 'approved' THEN 1 END) as approved_entries,
        COUNT(CASE WHEN sse.status = 'rejected' THEN 1 END) as rejected_entries,
        AVG(CASE WHEN sse.status = 'approved' THEN 1.0 ELSE 0.0 END) * 100 as approval_rate
      FROM student_sheets ss
      LEFT JOIN student_sheet_entries sse ON ss.id = sse.sheet_id
    `);

    // Get department-wise statistics
    const deptStatsResult = await pool.query(`
      SELECT 
        s.department,
        COUNT(DISTINCT ss.id) as sheets_count,
        COUNT(sse.id) as entries_count,
        COUNT(CASE WHEN sse.status = 'approved' THEN 1 END) as approved_count
      FROM student_sheets ss
      JOIN students s ON ss.student_id = s.id
      LEFT JOIN student_sheet_entries sse ON ss.id = sse.sheet_id
      GROUP BY s.department
      ORDER BY entries_count DESC
    `);

    // Get recent activity
    const recentActivityResult = await pool.query(`
      SELECT 
        sse.*,
        s.department,
        u.first_name,
        u.last_name
      FROM student_sheet_entries sse
      JOIN student_sheets ss ON sse.sheet_id = ss.id
      JOIN students s ON ss.student_id = s.id
      JOIN users u ON s.user_id = u.id
      ORDER BY sse.created_at DESC
      LIMIT 10
    `);

    const stats = statsResult.rows[0];
    
    res.json({
      success: true,
      message: 'Sheet statistics retrieved successfully',
      data: {
        overview: {
          total_sheets: parseInt(stats.total_sheets) || 0,
          total_entries: parseInt(stats.total_entries) || 0,
          approved_entries: parseInt(stats.approved_entries) || 0,
          rejected_entries: parseInt(stats.rejected_entries) || 0,
          approval_rate: parseFloat(stats.approval_rate) || 0
        },
        department_stats: deptStatsResult.rows,
        recent_activity: recentActivityResult.rows
      }
    });

  } catch (error) {
    console.error('❌ Error getting sheet statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving statistics'
    });
  }
});

module.exports = router;
