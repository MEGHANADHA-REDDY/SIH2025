const express = require('express');
const { auth, isFaculty } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Get faculty dashboard data
router.get('/dashboard', auth, isFaculty, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get faculty profile
    const facultyResult = await pool.query(`
      SELECT f.*, u.first_name, u.last_name, u.email
      FROM faculty f
      JOIN users u ON f.user_id = u.id
      WHERE f.user_id = $1
    `, [userId]);

    if (facultyResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Faculty profile not found'
      });
    }

    const faculty = facultyResult.rows[0];

    // Get pending activities count
    const pendingActivitiesResult = await pool.query(
      'SELECT COUNT(*) as count FROM activities WHERE status = $1',
      ['pending']
    );

    // Get approved activities count (by this faculty)
    const approvedActivitiesResult = await pool.query(
      'SELECT COUNT(*) as count FROM activities WHERE approved_by = $1',
      [faculty.id]
    );

    // Get recent activities to review
    const recentActivitiesResult = await pool.query(`
      SELECT 
        a.*,
        s.student_id,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        ac.name as category_name
      FROM activities a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN activity_categories ac ON a.category = ac.name
      WHERE a.status = 'pending'
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    // Get department statistics
    const departmentStatsResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT s.id) as total_students,
        COUNT(a.id) as total_activities,
        COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_activities
      FROM students s
      LEFT JOIN activities a ON s.id = a.student_id
      WHERE s.department = $1
    `, [faculty.department]);

    res.json({
      message: 'Dashboard data retrieved successfully',
      data: {
        profile: faculty,
        statistics: {
          pendingActivities: parseInt(pendingActivitiesResult.rows[0].count),
          approvedActivities: parseInt(approvedActivitiesResult.rows[0].count),
          departmentStats: departmentStatsResult.rows[0]
        },
        recentActivities: recentActivitiesResult.rows
      }
    });

  } catch (error) {
    console.error('Faculty dashboard error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving dashboard data'
    });
  }
});

// Get students in faculty's department
router.get('/students', auth, isFaculty, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, search } = req.query;

    // Get faculty department
    const facultyResult = await pool.query(
      'SELECT department FROM faculty WHERE user_id = $1',
      [userId]
    );

    if (facultyResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Faculty profile not found'
      });
    }

    const department = facultyResult.rows[0].department;

    // Build query
    let query = `
      SELECT 
        s.*,
        u.first_name,
        u.last_name,
        u.email,
        COUNT(a.id) as total_activities,
        COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_activities
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN activities a ON s.id = a.student_id
      WHERE s.department = $1
    `;
    
    const queryParams = [department];
    let paramCount = 1;

    if (search) {
      paramCount++;
      query += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR s.student_id ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    query += ` GROUP BY s.id, u.first_name, u.last_name, u.email`;

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
      SELECT COUNT(DISTINCT s.id) 
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.department = $1
    `;
    const countParams = [department];
    let countParamCount = 1;

    if (search) {
      countParamCount++;
      countQuery += ` AND (u.first_name ILIKE $${countParamCount} OR u.last_name ILIKE $${countParamCount} OR s.student_id ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      message: 'Students retrieved successfully',
      data: {
        students: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Students retrieval error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving students'
    });
  }
});

// Get student details
router.get('/students/:id', auth, isFaculty, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Get faculty department
    const facultyResult = await pool.query(
      'SELECT department FROM faculty WHERE user_id = $1',
      [userId]
    );

    if (facultyResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Faculty profile not found'
      });
    }

    const department = facultyResult.rows[0].department;

    // Get student details
    const studentResult = await pool.query(`
      SELECT 
        s.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1 AND s.department = $2
    `, [id, department]);

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Student not found or access denied'
      });
    }

    const student = studentResult.rows[0];

    // Get student activities
    const activitiesResult = await pool.query(`
      SELECT 
        a.*,
        ac.name as category_name,
        f.first_name as approved_by_name,
        f.last_name as approved_by_last_name
      FROM activities a
      LEFT JOIN activity_categories ac ON a.category = ac.name
      LEFT JOIN faculty f ON a.approved_by = f.id
      WHERE a.student_id = $1
      ORDER BY a.created_at DESC
    `, [id]);

    res.json({
      message: 'Student details retrieved successfully',
      data: {
        student,
        activities: activitiesResult.rows
      }
    });

  } catch (error) {
    console.error('Student details error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving student details'
    });
  }
});

// Get faculty statistics
router.get('/statistics', auth, isFaculty, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get faculty department
    const facultyResult = await pool.query(
      'SELECT department FROM faculty WHERE user_id = $1',
      [userId]
    );

    if (facultyResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Faculty profile not found'
      });
    }

    const department = facultyResult.rows[0].department;

    // Get department statistics
    const statsResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT s.id) as total_students,
        COUNT(a.id) as total_activities,
        COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_activities,
        COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_activities,
        COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejected_activities
      FROM students s
      LEFT JOIN activities a ON s.id = a.student_id
      WHERE s.department = $1
    `, [department]);

    // Get activities by category
    const categoryStatsResult = await pool.query(`
      SELECT 
        a.category,
        COUNT(*) as total_count,
        COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_count
      FROM activities a
      JOIN students s ON a.student_id = s.id
      WHERE s.department = $1
      GROUP BY a.category
      ORDER BY total_count DESC
    `, [department]);

    // Get monthly activity trends
    const monthlyStatsResult = await pool.query(`
      SELECT 
        DATE_TRUNC('month', a.created_at) as month,
        COUNT(*) as activity_count,
        COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_count
      FROM activities a
      JOIN students s ON a.student_id = s.id
      WHERE s.department = $1 AND a.created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', a.created_at)
      ORDER BY month
    `, [department]);

    res.json({
      message: 'Statistics retrieved successfully',
      data: {
        departmentStats: statsResult.rows[0],
        categoryStats: categoryStatsResult.rows,
        monthlyTrends: monthlyStatsResult.rows
      }
    });

  } catch (error) {
    console.error('Faculty statistics error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving statistics'
    });
  }
});

module.exports = router;
