const express = require('express');
const { auth, isStudent } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Get student dashboard data
router.get('/dashboard', auth, isStudent, async (req, res) => {
  try {
    const userId = req.user.userId;

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
        f.first_name as approved_by_name
      FROM activities a
      LEFT JOIN activity_categories ac ON a.category = ac.name
      LEFT JOIN faculty f ON a.approved_by = f.id
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
        f.first_name as approved_by_name,
        f.last_name as approved_by_last_name
      FROM activities a
      LEFT JOIN activity_categories ac ON a.category = ac.name
      LEFT JOIN faculty f ON a.approved_by = f.id
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

module.exports = router;
