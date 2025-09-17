const express = require('express');
const builtinSheetsService = require('../services/builtinSheets');
const { getPool } = require('../config/database');

const router = express.Router();

/**
 * Webhook endpoint to handle project status updates
 * Triggered when faculty approves or rejects student activities
 */
router.post('/project-status', async (req, res) => {
  try {
    console.log('📨 Webhook triggered with payload:', req.body);

    // Extract data from request payload
    const {
      student_name,
      project_url,
      course_name,
      status,
      faculty_name,
      certificate_id,
      validation_score,
      readable_date,
      student_id,
      activity_type,
      category,
      activity_id
    } = req.body;

    // Validate required fields
    if (!student_name || !status || !faculty_name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: student_name, status, faculty_name'
      });
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected"'
      });
    }

    // Process the data and append to Google Sheets
    const processedData = {
      student_name,
      project_url: project_url || '',
      course_name: course_name || category || '',
      status,
      faculty_name,
      certificate_id: certificate_id || activity_id || '',
      validation_score: validation_score || '',
      readable_date: readable_date || new Date().toLocaleDateString(),
      student_id: student_id || '',
      activity_type: activity_type || '',
      category: category || ''
    };

    // Add data to built-in sheets
    const result = await builtinSheetsService.addActivityToSheet(processedData);

    console.log('✅ Successfully processed webhook and updated built-in sheet');

    res.json({
      success: true,
      message: 'Project status update processed successfully',
      data: {
        sheetId: result.sheetId,
        shareToken: result.shareToken,
        entryId: result.entryId,
        processedData
      }
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while processing webhook',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

/**
 * Test endpoint to validate webhook functionality
 */
router.post('/test', async (req, res) => {
  try {
    const testData = {
      student_name: 'John Doe',
      project_url: 'https://github.com/johndoe/test-project',
      course_name: 'Computer Science',
      status: 'approved',
      faculty_name: 'Dr. Smith',
      certificate_id: 'CERT-12345',
      validation_score: '95',
      readable_date: new Date().toLocaleDateString(),
      student_id: 'CS2021001',
      activity_type: 'Project',
      category: 'Technical'
    };

    const result = await builtinSheetsService.addActivityToSheet(testData);

    res.json({
      success: true,
      message: 'Test webhook processed successfully',
      data: {
        sheetId: result.sheetId,
        shareToken: result.shareToken,
        entryId: result.entryId,
        testData
      }
    });

  } catch (error) {
    console.error('❌ Test webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Test webhook failed',
      error: error.message
    });
  }
});

/**
 * Health check endpoint for webhook service
 */
router.get('/health', async (req, res) => {
  try {
    // Test database connection for built-in sheets
    const pool = getPool();
    await pool.query('SELECT 1');
    
    res.json({
      success: true,
      message: 'Webhook service is healthy',
      builtinSheetsConfigured: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Webhook service health check failed',
      error: error.message
    });
  }
});

/**
 * Get activity data for triggering webhook (internal use)
 */
async function getActivityDataForWebhook(activityId) {
  try {
    const pool = getPool();
    
    const result = await pool.query(`
      SELECT 
        a.*,
        s.student_id,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        fu.first_name as faculty_first_name,
        fu.last_name as faculty_last_name,
        ac.name as category_name
      FROM activities a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN faculty f ON a.approved_by = f.id
      LEFT JOIN users fu ON f.user_id = fu.id
      LEFT JOIN activity_categories ac ON a.category = ac.name
      WHERE a.id = $1
    `, [activityId]);

    if (result.rows.length === 0) {
      throw new Error(`Activity with ID ${activityId} not found`);
    }

    const activity = result.rows[0];
    
    return {
      student_name: `${activity.student_first_name} ${activity.student_last_name}`,
      project_url: activity.github_url || activity.certificate_url || '',
      course_name: activity.category_name || activity.category,
      status: activity.status,
      faculty_name: activity.faculty_first_name && activity.faculty_last_name 
        ? `${activity.faculty_first_name} ${activity.faculty_last_name}` 
        : 'Unknown Faculty',
      certificate_id: activity.id.toString(),
      validation_score: '', // Could be calculated based on activity points
      readable_date: activity.approved_at 
        ? new Date(activity.approved_at).toLocaleDateString()
        : new Date().toLocaleDateString(),
      student_id: activity.student_id,
      student_db_id: activity.student_id, // This is the database ID from students table
      activity_type: activity.activity_type,
      category: activity.category,
      activity_id: activity.id
    };
  } catch (error) {
    console.error('❌ Error getting activity data for webhook:', error);
    throw error;
  }
}

module.exports = { 
  router, 
  getActivityDataForWebhook 
};
