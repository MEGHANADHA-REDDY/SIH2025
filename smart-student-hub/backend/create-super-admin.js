const bcrypt = require('bcryptjs');
const { getPool } = require('./config/database');

async function createSuperAdmin() {
  try {
    console.log('🔧 Creating Super Admin Account...');
    
    const pool = getPool();
    
    // Check if super admin already exists
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE role = $1',
      ['super_admin']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('✅ Super admin already exists!');
      return;
    }

    // Super admin credentials
    const superAdminData = {
      email: 'superadmin@smarthub.edu',
      password: 'SuperAdmin@123',
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+1-555-0123'
    };

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(superAdminData.password, saltRounds);

    // Create super admin user
    const userResult = await pool.query(
      'INSERT INTO users (email, password, role, first_name, last_name, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, role, first_name, last_name, created_at',
      [superAdminData.email, hashedPassword, 'super_admin', superAdminData.firstName, superAdminData.lastName, superAdminData.phone]
    );

    const user = userResult.rows[0];

    console.log('✅ Super Admin created successfully!');
    console.log('📧 Email:', user.email);
    console.log('🔑 Password:', superAdminData.password);
    console.log('👤 Name:', user.first_name, user.last_name);
    console.log('🆔 User ID:', user.id);
    console.log('📅 Created:', user.created_at);
    console.log('\n🚀 You can now login with these credentials to access the Super Admin Dashboard!');

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
  }
}

// Run the script
createSuperAdmin().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
