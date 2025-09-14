const { Pool } = require('pg');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🗄️  Smart Student Hub Database Setup');
console.log('=====================================\n');

rl.question('Enter PostgreSQL password for user "postgres": ', async (password) => {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'postgres', // Connect to default database first
    user: 'postgres',
    password: password,
    ssl: false
  });

  try {
    console.log('\n🔍 Testing connection...');
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully!');

    // Create database if it doesn't exist
    console.log('\n📊 Creating database "smart_student_hub"...');
    await client.query('CREATE DATABASE smart_student_hub');
    console.log('✅ Database created successfully!');

    client.release();
    await pool.end();

    console.log('\n🎉 Database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Create a .env file in the backend directory');
    console.log('2. Add your database credentials:');
    console.log('   DB_HOST=localhost');
    console.log('   DB_PORT=5432');
    console.log('   DB_NAME=smart_student_hub');
    console.log('   DB_USER=postgres');
    console.log('   DB_PASSWORD=' + password);
    console.log('\n3. Run: npm run dev');

  } catch (error) {
    if (error.code === '42P04') {
      console.log('✅ Database "smart_student_hub" already exists!');
    } else {
      console.error('❌ Error:', error.message);
      console.log('\nTroubleshooting:');
      console.log('1. Make sure PostgreSQL is running');
      console.log('2. Check if the password is correct');
      console.log('3. Verify PostgreSQL is listening on port 5432');
    }
  }

  rl.close();
});

