const express = require('express');
const { auth, isStudent } = require('../middleware/auth');
const { getPool } = require('../config/database');

const router = express.Router();

// Generate portfolio
router.post('/generate', auth, isStudent, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, isPublic = false } = req.body;

    if (!title) {
      return res.status(400).json({
        message: 'Portfolio title is required'
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

    // Generate unique share token
    const shareToken = require('crypto').randomBytes(32).toString('hex');

    // Create portfolio
    const result = await pool.query(`
      INSERT INTO portfolios (student_id, title, description, is_public, share_token)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [studentId, title, description, isPublic, shareToken]);

    const portfolio = result.rows[0];

    // Get portfolio data
    const portfolioData = await getPortfolioData(studentId);

    res.status(201).json({
      message: 'Portfolio generated successfully',
      data: {
        portfolio,
        shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/portfolio/${shareToken}`,
        portfolioData
      }
    });

  } catch (error) {
    console.error('Portfolio generation error:', error);
    res.status(500).json({
      message: 'Internal server error while generating portfolio'
    });
  }
});

// Get portfolio by share token (public access)
router.get('/share/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Get portfolio
    const portfolioResult = await pool.query(`
      SELECT p.*, s.student_id, u.first_name, u.last_name, u.email
      FROM portfolios p
      JOIN students s ON p.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE p.share_token = $1 AND p.is_public = true
    `, [token]);

    if (portfolioResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Portfolio not found or not publicly accessible'
      });
    }

    const portfolio = portfolioResult.rows[0];

    // Increment view count
    await pool.query(
      'UPDATE portfolios SET view_count = view_count + 1 WHERE id = $1',
      [portfolio.id]
    );

    // Get portfolio data
    const portfolioData = await getPortfolioData(portfolio.student_id);

    res.json({
      message: 'Portfolio retrieved successfully',
      data: {
        portfolio,
        portfolioData
      }
    });

  } catch (error) {
    console.error('Portfolio retrieval error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving portfolio'
    });
  }
});

// Get student's portfolios
router.get('/my-portfolios', auth, isStudent, async (req, res) => {
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

    // Get portfolios
    const result = await pool.query(`
      SELECT * FROM portfolios 
      WHERE student_id = $1
      ORDER BY created_at DESC
    `, [studentId]);

    // Add share URLs
    const portfolios = result.rows.map(portfolio => ({
      ...portfolio,
      shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/portfolio/${portfolio.share_token}`
    }));

    res.json({
      message: 'Portfolios retrieved successfully',
      data: portfolios
    });

  } catch (error) {
    console.error('Portfolios retrieval error:', error);
    res.status(500).json({
      message: 'Internal server error while retrieving portfolios'
    });
  }
});

// Update portfolio
router.put('/:id', auth, isStudent, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { title, description, isPublic } = req.body;

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

    // Update portfolio
    const result = await pool.query(`
      UPDATE portfolios 
      SET title = $1, description = $2, is_public = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND student_id = $5
      RETURNING *
    `, [title, description, isPublic, id, studentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Portfolio not found or access denied'
      });
    }

    res.json({
      message: 'Portfolio updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Portfolio update error:', error);
    res.status(500).json({
      message: 'Internal server error while updating portfolio'
    });
  }
});

// Delete portfolio
router.delete('/:id', auth, isStudent, async (req, res) => {
  try {
    const { id } = req.params;
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

    // Delete portfolio
    const result = await pool.query(
      'DELETE FROM portfolios WHERE id = $1 AND student_id = $2',
      [id, studentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Portfolio not found or access denied'
      });
    }

    res.json({
      message: 'Portfolio deleted successfully'
    });

  } catch (error) {
    console.error('Portfolio deletion error:', error);
    res.status(500).json({
      message: 'Internal server error while deleting portfolio'
    });
  }
});

// Helper function to get portfolio data
async function getPortfolioData(studentId) {
  try {
    // Get student profile
    const studentResult = await pool.query(`
      SELECT s.*, u.first_name, u.last_name, u.email, u.phone
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `, [studentId]);

    if (studentResult.rows.length === 0) {
      throw new Error('Student not found');
    }

    const student = studentResult.rows[0];

    // Get approved activities
    const activitiesResult = await pool.query(`
      SELECT 
        a.*,
        ac.name as category_name,
        f.first_name as approved_by_name,
        f.last_name as approved_by_last_name
      FROM activities a
      LEFT JOIN activity_categories ac ON a.category = ac.name
      LEFT JOIN faculty f ON a.approved_by = f.id
      WHERE a.student_id = $1 AND a.status = 'approved'
      ORDER BY a.created_at DESC
    `, [studentId]);

    // Get activity statistics
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_activities,
        COUNT(DISTINCT category) as unique_categories,
        COUNT(CASE WHEN activity_type = 'Academic Excellence' THEN 1 END) as academic_activities,
        COUNT(CASE WHEN activity_type = 'Conferences & Workshops' THEN 1 END) as conference_activities,
        COUNT(CASE WHEN activity_type = 'Certifications' THEN 1 END) as certification_activities,
        COUNT(CASE WHEN activity_type = 'Club Activities' THEN 1 END) as club_activities,
        COUNT(CASE WHEN activity_type = 'Volunteering' THEN 1 END) as volunteering_activities,
        COUNT(CASE WHEN activity_type = 'Competitions' THEN 1 END) as competition_activities,
        COUNT(CASE WHEN activity_type = 'Leadership Roles' THEN 1 END) as leadership_activities,
        COUNT(CASE WHEN activity_type = 'Internships' THEN 1 END) as internship_activities,
        COUNT(CASE WHEN activity_type = 'Research' THEN 1 END) as research_activities,
        COUNT(CASE WHEN activity_type = 'Sports & Cultural' THEN 1 END) as sports_activities
      FROM activities 
      WHERE student_id = $1 AND status = 'approved'
    `, [studentId]);

    // Get activities by category
    const categoryStatsResult = await pool.query(`
      SELECT 
        category,
        COUNT(*) as count,
        ac.points
      FROM activities a
      LEFT JOIN activity_categories ac ON a.category = ac.name
      WHERE a.student_id = $1 AND a.status = 'approved'
      GROUP BY category, ac.points
      ORDER BY count DESC
    `, [studentId]);

    return {
      student,
      activities: activitiesResult.rows,
      statistics: statsResult.rows[0],
      categoryStats: categoryStatsResult.rows
    };

  } catch (error) {
    console.error('Error getting portfolio data:', error);
    throw error;
  }
}

module.exports = router;
