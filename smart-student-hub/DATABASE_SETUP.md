# Database Setup Guide

## PostgreSQL Setup

### 1. Install PostgreSQL
- Download and install PostgreSQL from https://www.postgresql.org/download/
- During installation, set a password for the `postgres` user
- Make sure PostgreSQL service is running

### 2. Create Database
Open PostgreSQL command line or pgAdmin and run:

```sql
CREATE DATABASE smart_student_hub;
```

### 3. Configure Environment Variables
Create a `.env` file in the `backend` directory with the following content:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_student_hub
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure_12345
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 4. Common PostgreSQL Issues

#### Issue: "password authentication failed for user 'postgres'"
**Solution:**
1. Check if PostgreSQL is running
2. Verify the password in your `.env` file matches your PostgreSQL password
3. Try connecting with psql to test:
   ```bash
   psql -U postgres -h localhost
   ```

#### Issue: "database does not exist"
**Solution:**
1. Create the database:
   ```sql
   CREATE DATABASE smart_student_hub;
   ```

#### Issue: "connection refused"
**Solution:**
1. Make sure PostgreSQL service is running
2. Check if PostgreSQL is listening on port 5432
3. Verify firewall settings

### 5. Alternative: Use Default Settings
If you want to use the default settings, the server will use these fallback values:
- Host: localhost
- Port: 5432
- Database: smart_student_hub
- User: postgres
- Password: password

### 6. Test Connection
After setting up, restart the backend server:
```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connected and initialized successfully
```

### 7. Database Tables
The system will automatically create these tables:
- users
- students
- faculty
- recruiters
- activities
- portfolios
- activity_categories

### 8. Default Data
The system will automatically insert default activity categories:
- Academic Excellence (10 points)
- Conferences & Workshops (8 points)
- Certifications (7 points)
- Club Activities (5 points)
- Volunteering (6 points)
- Competitions (9 points)
- Leadership Roles (8 points)
- Internships (10 points)
- Research (12 points)
- Sports & Cultural (4 points)

