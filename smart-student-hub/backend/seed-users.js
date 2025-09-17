const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();
const { getPool, initializeDatabase, testConnection } = require('./config/database');

async function upsertUser(pool, { email, password, role, firstName, lastName, phone }) {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  const hashed = await bcrypt.hash(password, 12);
  const result = await pool.query(
    'INSERT INTO users (email, password, role, first_name, last_name, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [email, hashed, role, firstName, lastName, phone || null]
  );
  return result.rows[0].id;
}

async function upsertStudent(pool, { userId, studentId, department }) {
  const existing = await pool.query('SELECT id FROM students WHERE user_id = $1', [userId]);
  if (existing.rows.length > 0) return existing.rows[0].id;
  const result = await pool.query(
    'INSERT INTO students (user_id, student_id, department, year_of_study) VALUES ($1, $2, $3, $4) RETURNING id',
    [userId, studentId, department || 'CSE', 3]
  );
  return result.rows[0].id;
}

async function upsertFaculty(pool, { userId, employeeId, department }) {
  const existing = await pool.query('SELECT id FROM faculty WHERE user_id = $1', [userId]);
  if (existing.rows.length > 0) return existing.rows[0].id;
  const result = await pool.query(
    'INSERT INTO faculty (user_id, employee_id, department, designation) VALUES ($1, $2, $3, $4) RETURNING id',
    [userId, employeeId, department || 'CSE', 'Faculty']
  );
  return result.rows[0].id;
}

async function upsertRecruiter(pool, { userId, company, designation }) {
  const existing = await pool.query('SELECT id FROM recruiters WHERE user_id = $1', [userId]);
  if (existing.rows.length > 0) return existing.rows[0].id;
  const result = await pool.query(
    'INSERT INTO recruiters (user_id, company, designation, industry) VALUES ($1, $2, $3, $4) RETURNING id',
    [userId, company || 'Tech Corp', designation || 'HR Manager', 'Technology']
  );
  return result.rows[0].id;
}

async function main() {
  console.log('🔧 Seeding initial users...');
  await testConnection();
  await initializeDatabase();
  const pool = getPool();

  const users = [
    { email: 'superadmin@smarthub.edu', password: 'admin123', role: 'super_admin', firstName: 'Super', lastName: 'Admin' },
    { email: 'admin@smarthub.edu', password: 'admin123', role: 'admin', firstName: 'Normal', lastName: 'Admin' },
    { email: 'megha@gmail.com', password: 'password123', role: 'student', firstName: 'Megha', lastName: 'Student' },
    { email: 'meghaf@gmail.com', password: 'password123', role: 'faculty', firstName: 'Megha', lastName: 'Faculty' },
    { email: 'monkeydluffy6823140@gmail.com', password: 'password123', role: 'faculty', firstName: 'Monkey', lastName: 'DLuffy' },
    { email: 'meghaa@gmail.com', password: 'password123', role: 'admin', firstName: 'Megha', lastName: 'Admin' },
    { email: 'recruiter@techcorp.com', password: 'recruiter123', role: 'recruiter', firstName: 'Sarah', lastName: 'Johnson', phone: '+1-555-0123' },
  ];

  const created = [];

  for (const u of users) {
    const userId = await upsertUser(pool, u);
    if (u.role === 'student') {
      await upsertStudent(pool, { userId, studentId: 'STU0001', department: 'CSE' });
    }
    if (u.role === 'faculty') {
      // Generate distinct employee IDs
      const suffix = Math.floor(1000 + Math.random() * 9000);
      await upsertFaculty(pool, { userId, employeeId: `FAC${suffix}`, department: 'CSE' });
    }
    if (u.role === 'recruiter') {
      await upsertRecruiter(pool, { 
        userId, 
        company: 'TechCorp Solutions', 
        designation: 'Senior Talent Acquisition Manager' 
      });
    }
    created.push({ email: u.email, role: u.role });
  }

  console.log('✅ Seed complete. Users present:');
  created.forEach((c) => console.log(` - ${c.email} (${c.role})`));
  console.log('\nYou can now login using the provided credentials.');

  await pool.end();
}

main().catch((err) => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});


