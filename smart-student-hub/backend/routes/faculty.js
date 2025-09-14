const express = require('express');
const { auth, isFaculty } = require('../middleware/auth');
const { getPool } = require('../config/database');

const router = express.Router();

// Get faculty dashboard data
router.get('/dashboard', auth, isFaculty, async (req, res) => {
  try {
    const userId = req.user.userId;
    const pool = getPool();

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

    // Get recent activities pending review
    const recentActivitiesResult = await pool.query(`
      SELECT 
        a.*,
        s.id as student_db_id,
        s.student_id as student_number,
        s.department as student_department,
        s.year_of_study as student_year,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        u.email as student_email,
        ac.name as category_name,
        ac.points
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
    const pool = getPool();

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
    const pool = getPool();

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
        fu.first_name as approved_by_name,
        fu.last_name as approved_by_last_name
      FROM activities a
      LEFT JOIN activity_categories ac ON a.category = ac.name
      LEFT JOIN faculty f ON a.approved_by = f.id
      LEFT JOIN users fu ON f.user_id = fu.id
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
    const pool = getPool();

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

// Debug endpoint to check faculty status
router.get('/debug-status', auth, async (req, res) => {
  try {
    const pool = getPool();
    console.log('Debug endpoint hit by user:', req.user);
    
    // Check if user exists in faculty table
    const facultyResult = await pool.query(
      'SELECT * FROM faculty WHERE user_id = $1',
      [req.user.userId]
    );
    
    // Check total students count
    const studentsCount = await pool.query('SELECT COUNT(*) FROM students s JOIN users u ON s.user_id = u.id WHERE u.is_active = true');
    
    res.json({
      user: req.user,
      isFaculty: req.user.role === 'faculty',
      facultyRecord: facultyResult.rows[0] || null,
      totalStudents: studentsCount.rows[0].count
    });
  } catch (error) {
    console.error('Debug status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all students with basic info (optimized version)
router.get('/students-simple', auth, isFaculty, async (req, res) => {
  try {
    const pool = getPool();
    
    // Get basic student info
    const result = await pool.query(`
      SELECT 
        s.id,
        s.student_id as student_number,
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
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE u.is_active = true
      ORDER BY u.first_name, u.last_name
    `);
    
    // Helper function to safely parse JSON
    const safeJSONParse = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }
      return [];
    };
    
    // Process students with basic activity stats (simplified)
    const processedStudents = await Promise.all(
      result.rows.map(async (student) => {
        try {
          // Get basic activity count for each student
          const activityResult = await pool.query(
            'SELECT COUNT(*) as total, COUNT(CASE WHEN status = $1 THEN 1 END) as approved FROM activities WHERE student_id = $2',
            ['approved', student.id]
          );
          
          const activityStats = activityResult.rows[0] || { total: 0, approved: 0 };
          
          return {
            ...student,
            tech_stack: safeJSONParse(student.tech_stack),
            skills: safeJSONParse(student.skills),
            interests: safeJSONParse(student.interests),
            total_activities: parseInt(activityStats.total) || 0,
            approved_activities: parseInt(activityStats.approved) || 0,
            pending_activities: Math.max(0, (parseInt(activityStats.total) || 0) - (parseInt(activityStats.approved) || 0)),
            total_points: 0 // Simplified for performance
          };
        } catch (error) {
          console.error('Error processing student stats:', error);
          return {
            ...student,
            tech_stack: safeJSONParse(student.tech_stack),
            skills: safeJSONParse(student.skills),
            interests: safeJSONParse(student.interests),
            total_activities: 0,
            approved_activities: 0,
            pending_activities: 0,
            total_points: 0
          };
        }
      })
    );
    
    res.json({
      message: 'Students retrieved successfully',
      data: processedStudents
    });
    
  } catch (error) {
    console.error('Students fetch error:', error);
    res.status(500).json({
      message: 'Internal server error while fetching students'
    });
  }
});

// Get all students (faculty only)
router.get('/students', auth, isFaculty, async (req, res) => {
  try {
    console.log('Faculty students endpoint hit by user:', req.user);
    const pool = getPool();

    console.log('Executing students query...');
    
    // First, let's try a simple query to see if we get any students at all
    const simpleStudentsResult = await pool.query(`
      SELECT COUNT(*) as count FROM students s 
      JOIN users u ON s.user_id = u.id 
      WHERE u.is_active = true
    `);
    
    console.log('Simple student count:', simpleStudentsResult.rows[0]);
    
    // Get all students with their basic details first
    const studentsResult = await pool.query(`
      SELECT 
        s.id,
        s.student_id as student_number,
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
        s.created_at,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE u.is_active = true
      ORDER BY u.first_name, u.last_name
    `);

    console.log('Basic students query result:', studentsResult.rows.length, 'rows');
    console.log('Sample student data:', studentsResult.rows[0]);

    if (studentsResult.rows.length === 0) {
      console.log('No students found, returning empty array');
      return res.json({
        message: 'No students found',
        data: []
      });
    }

    // Now get activity statistics for each student separately
    console.log('Getting activity stats for', studentsResult.rows.length, 'students...');
    let studentsWithStats;
    
    try {
      studentsWithStats = await Promise.all(
        studentsResult.rows.map(async (student, index) => {
        console.log(`Processing student ${index + 1}/${studentsResult.rows.length}: ${student.first_name} ${student.last_name}`);
        
        try {
          const statsResult = await pool.query(`
            SELECT 
              COUNT(a.id) as total_activities,
              COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_activities,
              COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_activities,
              COALESCE(SUM(CASE WHEN a.status = 'approved' THEN ac.points END), 0) as total_points
            FROM activities a
            LEFT JOIN activity_categories ac ON a.category = ac.name
            WHERE a.student_id = $1
          `, [student.id]);

          const stats = statsResult.rows[0] || {
            total_activities: 0,
            approved_activities: 0,
            pending_activities: 0,
            total_points: 0
          };

          console.log(`Stats for student ${student.first_name}:`, stats);

          const processedStudent = {
            ...student,
            total_activities: parseInt(stats.total_activities) || 0,
            approved_activities: parseInt(stats.approved_activities) || 0,
            pending_activities: parseInt(stats.pending_activities) || 0,
            total_points: parseInt(stats.total_points) || 0
          };

          console.log(`Processed student ${student.first_name}:`, processedStudent);
          return processedStudent;
        } catch (error) {
          console.error('Error getting stats for student', student.id, ':', error);
          const fallbackStudent = {
            ...student,
            total_activities: 0,
            approved_activities: 0,
            pending_activities: 0,
            total_points: 0
          };
          console.log(`Fallback student ${student.first_name}:`, fallbackStudent);
          return fallbackStudent;
        }
      })
      );
      console.log('Promise.all completed successfully');
    } catch (promiseError) {
      console.error('Promise.all failed:', promiseError);
      // Fallback: return students without stats
      studentsWithStats = studentsResult.rows.map(student => ({
        ...student,
        total_activities: 0,
        approved_activities: 0,
        pending_activities: 0,
        total_points: 0
      }));
    }

    console.log('Students with stats result:', studentsWithStats.length, 'students');
    console.log('First student with stats (if any):', studentsWithStats[0]);

    // Helper function to safely parse JSON
    const safeJSONParse = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.warn('Failed to parse JSON:', value);
          return [];
        }
      }
      return [];
    };

    // Parse JSON fields for each student
    const processedStudents = studentsWithStats.map(student => ({
      ...student,
      tech_stack: safeJSONParse(student.tech_stack),
      skills: safeJSONParse(student.skills),
      interests: safeJSONParse(student.interests)
    }));

    console.log('Sending response with', processedStudents.length, 'processed students');

    res.json({
      message: 'Students retrieved successfully',
      data: processedStudents
    });

  } catch (error) {
    console.error('Students fetch error:', error);
    res.status(500).json({
      message: 'Internal server error while fetching students'
    });
  }
});

// Get all approved activities by this faculty
router.get('/approved-activities', auth, isFaculty, async (req, res) => {
  try {
    const userId = req.user.userId;
    const pool = getPool();

    // Get faculty ID
    const facultyResult = await pool.query(
      'SELECT id FROM faculty WHERE user_id = $1',
      [userId]
    );

    if (facultyResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Faculty profile not found'
      });
    }

    const facultyId = facultyResult.rows[0].id;

    // Get all approved activities by this faculty
    const activitiesResult = await pool.query(`
      SELECT 
        a.*,
        s.id as student_db_id,
        s.student_id as student_number,
        s.department as student_department,
        s.year_of_study as student_year,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        u.email as student_email,
        ac.name as category_name,
        ac.points
      FROM activities a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN activity_categories ac ON a.category = ac.name
      WHERE a.status = 'approved' AND a.approved_by = $1
      ORDER BY a.approved_at DESC
    `, [facultyId]);

    res.json({
      message: 'Approved activities retrieved successfully',
      data: activitiesResult.rows
    });

  } catch (error) {
    console.error('Approved activities fetch error:', error);
    res.status(500).json({
      message: 'Internal server error while fetching approved activities'
    });
  }
});

module.exports = router;
