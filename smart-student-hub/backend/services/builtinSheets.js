const { getPool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class BuiltinSheetsService {
  constructor() {
    this.cache = new Map(); // Cache for student sheet data
  }

  /**
   * Get or create a sheet for a student
   */
  async getStudentSheet(studentDbId) {
    try {
      const pool = getPool();
      
      // Check if sheet exists
      const result = await pool.query(
        'SELECT * FROM student_sheets WHERE student_id = $1',
        [studentDbId]
      );

      if (result.rows.length > 0) {
        return result.rows[0];
      }

      // Create new sheet
      const shareToken = uuidv4();
      const newSheet = await pool.query(`
        INSERT INTO student_sheets (student_id, share_token, created_at, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `, [studentDbId, shareToken]);

      console.log(`📊 Created new sheet for student ${studentDbId}`);
      return newSheet.rows[0];
    } catch (error) {
      console.error('❌ Error getting/creating student sheet:', error.message);
      throw error;
    }
  }

  /**
   * Add activity data to student sheet
   */
  async addActivityToSheet(data) {
    try {
      const {
        student_name,
        project_url,
        course_name,
        status,
        faculty_name,
        certificate_id,
        validation_score,
        readable_date,
        student_db_id,
        activity_type,
        category,
        activity_id
      } = data;

      // Get or create student sheet
      const sheet = await this.getStudentSheet(student_db_id);
      
      // Add activity entry
      const pool = getPool();
      const result = await pool.query(`
        INSERT INTO student_sheet_entries (
          sheet_id, activity_id, student_name, project_url, course_name, 
          status, faculty_name, certificate_id, validation_score, 
          entry_date, activity_type, category, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
        RETURNING *
      `, [
        sheet.id, activity_id, student_name, project_url || '', course_name || '',
        status, faculty_name, certificate_id || '', validation_score || '',
        readable_date || new Date().toLocaleDateString(), activity_type || '', category || ''
      ]);

      // Update sheet's updated_at timestamp
      await pool.query(
        'UPDATE student_sheets SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [sheet.id]
      );

      // Clear cache for this student
      this.cache.delete(student_db_id);

      console.log(`✅ Added activity to sheet for student ${student_name}`);
      return {
        success: true,
        sheetId: sheet.id,
        shareToken: sheet.share_token,
        entryId: result.rows[0].id
      };
    } catch (error) {
      console.error('❌ Error adding activity to sheet:', error.message);
      throw error;
    }
  }

  /**
   * Get sheet data by student ID
   */
  async getSheetData(studentDbId) {
    try {
      // Check cache first
      if (this.cache.has(studentDbId)) {
        return this.cache.get(studentDbId);
      }

      const pool = getPool();
      
      // Get sheet info with student details
      const sheetResult = await pool.query(`
        SELECT 
          ss.*,
          s.student_id as student_number,
          u.first_name,
          u.last_name,
          s.department,
          s.year_of_study
        FROM student_sheets ss
        JOIN students s ON ss.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE ss.student_id = $1
      `, [studentDbId]);

      if (sheetResult.rows.length === 0) {
        return null;
      }

      const sheet = sheetResult.rows[0];

      // Get all entries for this sheet
      const entriesResult = await pool.query(`
        SELECT * FROM student_sheet_entries 
        WHERE sheet_id = $1 
        ORDER BY created_at DESC
      `, [sheet.id]);

      const sheetData = {
        sheet: {
          id: sheet.id,
          student_id: sheet.student_id,
          student_number: sheet.student_number,
          student_name: `${sheet.first_name} ${sheet.last_name}`,
          department: sheet.department,
          year_of_study: sheet.year_of_study,
          share_token: sheet.share_token,
          created_at: sheet.created_at,
          updated_at: sheet.updated_at
        },
        entries: entriesResult.rows,
        summary: {
          total_activities: entriesResult.rows.length,
          approved_activities: entriesResult.rows.filter(e => e.status === 'approved').length,
          rejected_activities: entriesResult.rows.filter(e => e.status === 'rejected').length,
          latest_activity: entriesResult.rows[0]?.created_at || null
        }
      };

      // Cache the result
      this.cache.set(studentDbId, sheetData);
      
      return sheetData;
    } catch (error) {
      console.error('❌ Error getting sheet data:', error.message);
      throw error;
    }
  }

  /**
   * Get sheet data by share token (for public viewing)
   */
  async getSheetByShareToken(shareToken) {
    try {
      const pool = getPool();
      
      // Get sheet by share token
      const sheetResult = await pool.query(`
        SELECT 
          ss.*,
          s.student_id as student_number,
          u.first_name,
          u.last_name,
          s.department,
          s.year_of_study
        FROM student_sheets ss
        JOIN students s ON ss.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE ss.share_token = $1
      `, [shareToken]);

      if (sheetResult.rows.length === 0) {
        return null;
      }

      const sheet = sheetResult.rows[0];

      // Get all entries for this sheet
      const entriesResult = await pool.query(`
        SELECT * FROM student_sheet_entries 
        WHERE sheet_id = $1 
        ORDER BY created_at DESC
      `, [sheet.id]);

      return {
        sheet: {
          id: sheet.id,
          student_number: sheet.student_number,
          student_name: `${sheet.first_name} ${sheet.last_name}`,
          department: sheet.department,
          year_of_study: sheet.year_of_study,
          created_at: sheet.created_at,
          updated_at: sheet.updated_at
        },
        entries: entriesResult.rows,
        summary: {
          total_activities: entriesResult.rows.length,
          approved_activities: entriesResult.rows.filter(e => e.status === 'approved').length,
          rejected_activities: entriesResult.rows.filter(e => e.status === 'rejected').length,
          latest_activity: entriesResult.rows[0]?.created_at || null
        }
      };
    } catch (error) {
      console.error('❌ Error getting sheet by share token:', error.message);
      throw error;
    }
  }

  /**
   * Get all sheets (for admin view)
   */
  async getAllSheets() {
    try {
      const pool = getPool();
      
      const result = await pool.query(`
        SELECT 
          ss.*,
          s.student_id as student_number,
          u.first_name,
          u.last_name,
          s.department,
          s.year_of_study,
          COUNT(sse.id) as total_entries,
          COUNT(CASE WHEN sse.status = 'approved' THEN 1 END) as approved_count,
          COUNT(CASE WHEN sse.status = 'rejected' THEN 1 END) as rejected_count,
          MAX(sse.created_at) as latest_entry
        FROM student_sheets ss
        JOIN students s ON ss.student_id = s.id
        JOIN users u ON s.user_id = u.id
        LEFT JOIN student_sheet_entries sse ON ss.id = sse.sheet_id
        GROUP BY ss.id, s.student_id, u.first_name, u.last_name, s.department, s.year_of_study
        ORDER BY ss.updated_at DESC
      `);

      return result.rows.map(row => ({
        id: row.id,
        student_id: row.student_id,
        student_number: row.student_number,
        student_name: `${row.first_name} ${row.last_name}`,
        department: row.department,
        year_of_study: row.year_of_study,
        share_token: row.share_token,
        created_at: row.created_at,
        updated_at: row.updated_at,
        summary: {
          total_entries: parseInt(row.total_entries) || 0,
          approved_count: parseInt(row.approved_count) || 0,
          rejected_count: parseInt(row.rejected_count) || 0,
          latest_entry: row.latest_entry
        }
      }));
    } catch (error) {
      console.error('❌ Error getting all sheets:', error.message);
      throw error;
    }
  }

  /**
   * Generate new share token for a sheet
   */
  async regenerateShareToken(studentDbId) {
    try {
      const newToken = uuidv4();
      const pool = getPool();
      
      const result = await pool.query(`
        UPDATE student_sheets 
        SET share_token = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE student_id = $2 
        RETURNING *
      `, [newToken, studentDbId]);

      // Clear cache
      this.cache.delete(studentDbId);

      return result.rows[0];
    } catch (error) {
      console.error('❌ Error regenerating share token:', error.message);
      throw error;
    }
  }

  /**
   * Clear cache for a specific student or all
   */
  clearCache(studentDbId = null) {
    if (studentDbId) {
      this.cache.delete(studentDbId);
    } else {
      this.cache.clear();
    }
  }
}

// Export singleton instance
const builtinSheetsService = new BuiltinSheetsService();
module.exports = builtinSheetsService;
