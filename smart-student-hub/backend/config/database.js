const { Pool } = require('pg');

// Database configuration function
const getDbConfig = () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'smart_student_hub',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
});

// Create connection pool
const pool = new Pool(getDbConfig());

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test database connection
const testConnection = async () => {
  try {
    // Create a new connection with current environment variables
    const testPool = new Pool(getDbConfig());
    const client = await testPool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    await testPool.end();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Create a new connection with current environment variables
    const initPool = new Pool(getDbConfig());
    const client = await initPool.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'faculty', 'super_admin', 'admin', 'recruiter')),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create students table
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        student_id VARCHAR(50) UNIQUE NOT NULL,
        department VARCHAR(100),
        year_of_study INTEGER,
        cgpa DECIMAL(3,2),
        attendance_percentage DECIMAL(5,2),
        description TEXT,
        tech_stack TEXT,
        skills TEXT,
        interests TEXT,
        career_goals TEXT,
        linkedin_url VARCHAR(500),
        github_url VARCHAR(500),
        portfolio_url VARCHAR(500),
        resume_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add new profile columns if they don't exist (for existing databases)
    try {
      await client.query(`
        ALTER TABLE students 
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS tech_stack TEXT,
        ADD COLUMN IF NOT EXISTS skills TEXT,
        ADD COLUMN IF NOT EXISTS interests TEXT,
        ADD COLUMN IF NOT EXISTS career_goals TEXT,
        ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500),
        ADD COLUMN IF NOT EXISTS github_url VARCHAR(500),
        ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(500),
        ADD COLUMN IF NOT EXISTS resume_url VARCHAR(500)
      `);
    } catch (error) {
      // Columns might already exist, ignore error
      console.log('Profile columns already exist or error adding them:', error.message);
    }

    // Create faculty table
    await client.query(`
      CREATE TABLE IF NOT EXISTS faculty (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        department VARCHAR(100),
        designation VARCHAR(100),
        specialization VARCHAR(200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create recruiters table
    await client.query(`
      CREATE TABLE IF NOT EXISTS recruiters (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        company VARCHAR(255) NOT NULL,
        designation VARCHAR(100),
        industry VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create activities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        activity_type VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        start_date DATE,
        end_date DATE,
        organization VARCHAR(255),
        certificate_url VARCHAR(500),
        image_url VARCHAR(500),
        github_url VARCHAR(500),
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        approved_by INTEGER REFERENCES faculty(id),
        approved_at TIMESTAMP,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add optional columns for activities if not exists
    try {
      await client.query(`
        ALTER TABLE activities 
        ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
        ADD COLUMN IF NOT EXISTS github_url VARCHAR(500)
      `);
    } catch (error) {
      console.log('Optional activity columns exist or could not be added:', error.message);
    }

    // Create portfolios table
    await client.query(`
      CREATE TABLE IF NOT EXISTS portfolios (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        is_public BOOLEAN DEFAULT false,
        share_token VARCHAR(255) UNIQUE,
        pdf_url VARCHAR(500),
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create activity_categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        points INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create job_postings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_postings (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        recruiter_id INTEGER REFERENCES recruiters(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        company VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        job_type VARCHAR(100),
        salary_range VARCHAR(100),
        requirements TEXT,
        benefits TEXT,
        application_deadline DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create job_applications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id SERIAL PRIMARY KEY,
        job_posting_id INTEGER REFERENCES job_postings(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        cover_letter TEXT,
        resume_url VARCHAR(500),
        status VARCHAR(50) DEFAULT 'applied' CHECK (status IN ('applied', 'reviewed', 'shortlisted', 'rejected', 'hired')),
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default activity categories
    await client.query(`
      INSERT INTO activity_categories (name, description, points) VALUES
      ('Academic Excellence', 'Academic achievements and awards', 10),
      ('Conferences & Workshops', 'Participation in conferences and workshops', 8),
      ('Certifications', 'Professional certifications and courses', 7),
      ('Club Activities', 'Student club participation and leadership', 5),
      ('Volunteering', 'Community service and volunteering', 6),
      ('Competitions', 'Academic and non-academic competitions', 9),
      ('Leadership Roles', 'Student government and leadership positions', 8),
      ('Internships', 'Professional internships and work experience', 10),
      ('Research', 'Research projects and publications', 12),
      ('Sports & Cultural', 'Sports and cultural activities', 4)
      ON CONFLICT (name) DO NOTHING
    `);

    console.log('✅ Database tables initialized successfully');
    client.release();
    await initPool.end();
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    throw err;
  }
};

// Function to get a fresh pool with current environment variables
const getPool = () => new Pool(getDbConfig());

module.exports = {
  pool,
  getPool,
  testConnection,
  initializeDatabase
};
