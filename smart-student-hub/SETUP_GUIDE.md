# Smart Student Hub - Complete Setup Guide

## 🚀 Quick Start

### 1. Database Setup (PostgreSQL)

#### Option A: Automatic Setup
```bash
cd backend
node setup-db.js
```
Follow the prompts to enter your PostgreSQL password.

#### Option B: Manual Setup
1. **Install PostgreSQL** from https://www.postgresql.org/download/
2. **Create database:**
   ```sql
   CREATE DATABASE smart_student_hub;
   ```
3. **Create .env file** in `backend/` directory:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=smart_student_hub
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure_12345
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=development
   ```

### 2. Start the Application

#### Terminal 1 - Backend Server
```bash
cd smart-student-hub/backend
npm install
npm run dev
```

#### Terminal 2 - Frontend Server
```bash
cd smart-student-hub
npm install
npm run dev
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🔧 Troubleshooting

### Database Connection Issues

#### Error: "password authentication failed"
1. Check PostgreSQL is running
2. Verify password in `.env` file
3. Test connection: `psql -U postgres -h localhost`

#### Error: "database does not exist"
```sql
CREATE DATABASE smart_student_hub;
```

#### Error: "connection refused"
1. Start PostgreSQL service
2. Check port 5432 is open
3. Verify firewall settings

### Server Issues

#### Backend won't start
1. Check if port 5000 is available
2. Verify all dependencies are installed: `npm install`
3. Check `.env` file exists and has correct values

#### Frontend won't start
1. Check if port 3000 is available
2. Verify all dependencies are installed: `npm install`
3. Make sure backend is running on port 5000

## 📊 Testing the System

### 1. Register Users
Visit http://localhost:3000/register and create accounts for:
- **Student**: Select "Student" role
- **Faculty**: Select "Faculty" role
- **Admin**: Select "Admin" role
- **Recruiter**: Select "Recruiter" role

### 2. Test Authentication
1. Go to http://localhost:3000/login
2. Select user type
3. Login with registered credentials
4. Verify role-based dashboard redirection

### 3. Test Features
- **Student Dashboard**: View activities, statistics, portfolio
- **Faculty Dashboard**: Review pending activities, manage students
- **Admin Dashboard**: System overview, user management, reports
- **Recruiter Dashboard**: Search and filter students

## 🗄️ Database Schema

The system automatically creates these tables:
- `users` - Core user authentication
- `students` - Student-specific data
- `faculty` - Faculty information
- `recruiters` - Recruiter details
- `activities` - Student activities with approval workflow
- `portfolios` - Student portfolio management
- `activity_categories` - Predefined categories with points

## 🔐 Default Activity Categories

The system includes these default categories:
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

## 📱 Features Available

### Student Features
- ✅ User registration and authentication
- ✅ Activity submission and tracking
- ✅ Portfolio generation
- ✅ Statistics dashboard
- ✅ Profile management

### Faculty Features
- ✅ Student activity approval
- ✅ Department management
- ✅ Student search and filtering
- ✅ Analytics and reporting

### Admin Features
- ✅ System-wide statistics
- ✅ User management
- ✅ Activity category management
- ✅ Institutional reports
- ✅ Department analytics

### Recruiter Features
- ✅ Student search and filtering
- ✅ Portfolio access
- ✅ Student profile viewing
- ✅ Contact information access

## 🚀 Next Steps

After successful setup, you can:
1. **Add Activities**: Students can submit activities for approval
2. **Approve Activities**: Faculty can review and approve student activities
3. **Generate Reports**: Admins can generate institutional reports
4. **Manage Users**: Admins can activate/deactivate user accounts
5. **Customize Categories**: Admins can modify activity categories

## 📞 Support

If you encounter issues:
1. Check the terminal output for error messages
2. Verify all services are running (PostgreSQL, Backend, Frontend)
3. Check the `.env` file configuration
4. Ensure all dependencies are installed

## 🎯 Production Deployment

For production deployment:
1. Set `NODE_ENV=production` in `.env`
2. Use a production PostgreSQL database
3. Set secure JWT secrets
4. Configure proper SSL certificates
5. Set up reverse proxy (nginx)
6. Use PM2 for process management

