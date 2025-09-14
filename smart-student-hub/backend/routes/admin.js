const express = require('express');
const { auth, isAdmin } = require('../middleware/auth');
const { getPool } = require('../config/database');

const router = express.Router();

// Get admin dashboard data
router.get('/dashboard', auth, isAdmin, async (req, res) => {
  try {
    const pool = getPool();
    // Get overall statistics
    const statsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'faculty') as total_faculty,
        (SELECT COUNT(*) FROM activities) as total_activities,
        (SELECT COUNT(*) FROM activities WHERE status = 'approved') as approved_activities,
        (SELECT COUNT(*) FROM activities WHERE status = 'pending') as pending_activities,
        (SELECT COUNT(*) FROM activities WHERE status = 'rejected') as rejected_activities,
        (SELECT COUNT(*) FROM portfolios) as total_portfolios
    `);

    // Get department statistics
    const departmentStatsResult = await pool.query(`
      SELECT 
        s.department,
        COUNT(DISTINCT s.id) as student_count,
        COUNT(a.id) as activity_count,
        COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_count
      FROM students s
      LEFT JOIN activities a ON s.id = a.student_id
      GROUP BY s.department
      ORDER BY student_count DESC
    `);

    // Get recent activities
    const recentActivitiesResult = await pool.query(`
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
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    // Get monthly trends
    const monthlyTrendsResult = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as activity_count,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count
      FROM activities
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `);

    res.json({
      message: 'Admin dashboard data retrieved successfully',
      data: {
        statistics: statsResult.rows[0],
        departmentStats: departmentStatsResult.rows,
        recentActivities: recentActivitiesResult.rows,
        monthlyTrends: monthlyTrendsResult.rows
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving dashboard data'
    });
  }
});

// Get all users
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const { role, page = 1, limit = 10, search } = req.query;

    // Build query
    let query = `
      SELECT 
        u.id, u.email, u.role, u.first_name, u.last_name, u.phone, 
        u.is_active, u.created_at,
        CASE 
          WHEN u.role = 'student' THEN s.student_id
          WHEN u.role = 'faculty' THEN f.employee_id
          ELSE NULL
        END as identifier,
        CASE 
          WHEN u.role = 'student' THEN s.department
          WHEN u.role = 'faculty' THEN f.department
          ELSE NULL
        END as department
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN faculty f ON u.id = f.user_id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      query += ` AND u.role = $${paramCount}`;
      queryParams.push(role);
    }

    if (search) {
      paramCount++;
      query += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    query += ` ORDER BY u.created_at DESC`;

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
    let countQuery = 'SELECT COUNT(*) FROM users u WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    if (role) {
      countParamCount++;
      countQuery += ` AND u.role = $${countParamCount}`;
      countParams.push(role);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (u.first_name ILIKE $${countParamCount} OR u.last_name ILIKE $${countParamCount} OR u.email ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      message: 'Users retrieved successfully',
      data: {
        users: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Users retrieval error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving users'
    });
  }
});

// Update user status
router.put('/users/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        message: 'isActive must be a boolean value'
      });
    }

    const result = await pool.query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, role, is_active',
      [isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('User status update error:', error);
    res.status(500).json({
      message: 'Internal server error while updating user status'
    });
  }
});

// Get activity categories
router.get('/activity-categories', auth, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM activity_categories 
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

// Create activity category
router.post('/activity-categories', auth, isAdmin, async (req, res) => {
  try {
    const { name, description, points } = req.body;

    if (!name) {
      return res.status(400).json({
        message: 'Category name is required'
      });
    }

    const result = await pool.query(`
      INSERT INTO activity_categories (name, description, points)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, description, points || 0]);

    res.status(201).json({
      message: 'Activity category created successfully',
      data: result.rows[0]
    });

  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({
        message: 'Category with this name already exists'
      });
    }

    console.error('Activity category creation error:', error);
    res.status(500).json({
      message: 'Internal server error while creating activity category'
    });
  }
});

// Update activity category
router.put('/activity-categories/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, points, isActive } = req.body;

    const result = await pool.query(`
      UPDATE activity_categories 
      SET name = $1, description = $2, points = $3, is_active = $4
      WHERE id = $5
      RETURNING *
    `, [name, description, points, isActive, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Activity category not found'
      });
    }

    res.json({
      message: 'Activity category updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({
        message: 'Category with this name already exists'
      });
    }

    console.error('Activity category update error:', error);
    res.status(500).json({
      message: 'Internal server error while updating activity category'
    });
  }
});

// Delete activity category
router.delete('/activity-categories/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category is being used
    const usageResult = await pool.query(
      'SELECT COUNT(*) FROM activities WHERE category = (SELECT name FROM activity_categories WHERE id = $1)',
      [id]
    );

    if (parseInt(usageResult.rows[0].count) > 0) {
      return res.status(400).json({
        message: 'Cannot delete category that is being used by activities'
      });
    }

    const result = await pool.query(
      'DELETE FROM activity_categories WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Activity category not found'
      });
    }

    res.json({
      message: 'Activity category deleted successfully'
    });

  } catch (error) {
    console.error('Activity category deletion error:', error);
    res.status(500).json({
      message: 'Internal server error while deleting activity category'
    });
  }
});

// Generate institutional reports
router.get('/reports', auth, isAdmin, async (req, res) => {
  try {
    const { type, department, startDate, endDate } = req.query;

    let reportData = {};

    switch (type) {
      case 'overview':
        reportData = await generateOverviewReport(department, startDate, endDate);
        break;
      case 'department':
        reportData = await generateDepartmentReport(department, startDate, endDate);
        break;
      case 'activities':
        reportData = await generateActivitiesReport(department, startDate, endDate);
        break;
      default:
        return res.status(400).json({
          message: 'Invalid report type. Must be overview, department, or activities'
        });
    }

    res.json({
      message: 'Report generated successfully',
      data: reportData
    });

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      message: 'Internal server error while generating report'
    });
  }
});

// Helper functions for report generation
async function generateOverviewReport(department, startDate, endDate) {
  const query = `
    SELECT 
      COUNT(DISTINCT s.id) as total_students,
      COUNT(a.id) as total_activities,
      COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_activities,
      COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_activities,
      COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejected_activities,
      COUNT(p.id) as total_portfolios
    FROM students s
    LEFT JOIN activities a ON s.id = a.student_id
    LEFT JOIN portfolios p ON s.id = p.student_id
    WHERE 1=1
    ${department ? 'AND s.department = $1' : ''}
    ${startDate ? `AND a.created_at >= $${department ? 2 : 1}` : ''}
    ${endDate ? `AND a.created_at <= $${department ? 3 : startDate ? 2 : 1}` : ''}
  `;

  const params = [];
  if (department) params.push(department);
  if (startDate) params.push(startDate);
  if (endDate) params.push(endDate);

  const result = await pool.query(query, params);
  return result.rows[0];
}

async function generateDepartmentReport(department, startDate, endDate) {
  const query = `
    SELECT 
      s.department,
      COUNT(DISTINCT s.id) as student_count,
      COUNT(a.id) as activity_count,
      COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_count,
      AVG(s.cgpa) as avg_cgpa,
      AVG(s.attendance_percentage) as avg_attendance
    FROM students s
    LEFT JOIN activities a ON s.id = a.student_id
    WHERE 1=1
    ${department ? 'AND s.department = $1' : ''}
    ${startDate ? `AND a.created_at >= $${department ? 2 : 1}` : ''}
    ${endDate ? `AND a.created_at <= $${department ? 3 : startDate ? 2 : 1}` : ''}
    GROUP BY s.department
    ORDER BY student_count DESC
  `;

  const params = [];
  if (department) params.push(department);
  if (startDate) params.push(startDate);
  if (endDate) params.push(endDate);

  const result = await pool.query(query, params);
  return result.rows;
}

async function generateActivitiesReport(department, startDate, endDate) {
  const query = `
    SELECT 
      a.category,
      COUNT(*) as total_count,
      COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_count,
      COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_count,
      COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejected_count
    FROM activities a
    JOIN students s ON a.student_id = s.id
    WHERE 1=1
    ${department ? 'AND s.department = $1' : ''}
    ${startDate ? `AND a.created_at >= $${department ? 2 : 1}` : ''}
    ${endDate ? `AND a.created_at <= $${department ? 3 : startDate ? 2 : 1}` : ''}
    GROUP BY a.category
    ORDER BY total_count DESC
  `;

  const params = [];
  if (department) params.push(department);
  if (startDate) params.push(startDate);
  if (endDate) params.push(endDate);

  const result = await pool.query(query, params);
  return result.rows;
}

module.exports = router;
