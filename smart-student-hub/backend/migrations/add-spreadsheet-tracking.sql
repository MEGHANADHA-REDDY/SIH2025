-- Add table to track Google Sheets spreadsheet IDs for each student
-- This prevents creating duplicate spreadsheets for the same student

CREATE TABLE IF NOT EXISTS student_spreadsheets (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    spreadsheet_id VARCHAR(100) NOT NULL,
    spreadsheet_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_student_spreadsheets_student_id ON student_spreadsheets(student_id);
CREATE INDEX IF NOT EXISTS idx_student_spreadsheets_spreadsheet_id ON student_spreadsheets(spreadsheet_id);

-- Add comments for documentation
COMMENT ON TABLE student_spreadsheets IS 'Tracks Google Sheets spreadsheet IDs for each student';
COMMENT ON COLUMN student_spreadsheets.student_id IS 'Reference to the student';
COMMENT ON COLUMN student_spreadsheets.spreadsheet_id IS 'Google Sheets spreadsheet ID';
COMMENT ON COLUMN student_spreadsheets.spreadsheet_url IS 'Full URL to the Google Sheet';
COMMENT ON COLUMN student_spreadsheets.created_at IS 'When the spreadsheet was first created';
COMMENT ON COLUMN student_spreadsheets.updated_at IS 'Last time the record was updated';
