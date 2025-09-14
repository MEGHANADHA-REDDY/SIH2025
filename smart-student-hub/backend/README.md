# Smart Student Hub - Backend API

A comprehensive Node.js/Express backend API for the Smart Student Hub platform, providing centralized student achievement management.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Student, Faculty, Admin)
- Password hashing with bcrypt
- User profile management

### Student Management
- Student registration and profile management
- Activity upload and tracking
- Portfolio generation
- Dashboard with statistics

### Faculty Management
- Faculty approval workflow
- Student activity review
- Department-wise analytics
- Activity validation

### Admin Features
- User management
- Activity category management
- Institutional reporting
- System analytics

### File Management
- Certificate upload with Multer
- File validation and storage
- Secure file serving

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Password Hashing**: bcryptjs
- **Environment**: dotenv

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration and initialization
├── middleware/
│   └── auth.js             # Authentication middleware
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── students.js         # Student-specific routes
│   ├── faculty.js          # Faculty-specific routes
│   ├── activities.js       # Activity management routes
│   ├── portfolio.js        # Portfolio generation routes
│   └── admin.js            # Admin management routes
├── uploads/                # File upload directory
├── server.js               # Main server file
├── package.json
└── README.md
```

## 🗄️ Database Schema

### Core Tables
- **users**: User authentication and basic info
- **students**: Student-specific information
- **faculty**: Faculty-specific information
- **activities**: Student activities and achievements
- **portfolios**: Generated student portfolios
- **activity_categories**: Predefined activity categories

### Key Relationships
- Users → Students/Faculty (1:1)
- Students → Activities (1:many)
- Faculty → Activities (approval relationship)
- Students → Portfolios (1:many)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=smart_student_hub
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   ```

3. **Database Setup**
   - Create PostgreSQL database
   - Update connection details in `.env`
   - Tables will be created automatically on first run

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Start Production Server**
   ```bash
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Students
- `GET /api/students/dashboard` - Student dashboard data
- `GET /api/students/activities` - Get student activities
- `GET /api/students/activity-categories` - Get activity categories
- `GET /api/students/statistics` - Get student statistics

### Activities
- `POST /api/activities/upload` - Upload activity with certificate
- `GET /api/activities` - Get all activities (faculty/admin)
- `GET /api/activities/:id` - Get activity by ID
- `PUT /api/activities/:id` - Update activity (student)
- `PUT /api/activities/:id/approve` - Approve/reject activity (faculty)
- `DELETE /api/activities/:id` - Delete activity (student)

### Faculty
- `GET /api/faculty/dashboard` - Faculty dashboard data
- `GET /api/faculty/students` - Get students in department
- `GET /api/faculty/students/:id` - Get student details
- `GET /api/faculty/statistics` - Get faculty statistics

### Portfolio
- `POST /api/portfolio/generate` - Generate portfolio
- `GET /api/portfolio/share/:token` - Get public portfolio
- `GET /api/portfolio/my-portfolios` - Get student portfolios
- `PUT /api/portfolio/:id` - Update portfolio
- `DELETE /api/portfolio/:id` - Delete portfolio

### Admin
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/activity-categories` - Get activity categories
- `POST /api/admin/activity-categories` - Create activity category
- `PUT /api/admin/activity-categories/:id` - Update activity category
- `DELETE /api/admin/activity-categories/:id` - Delete activity category
- `GET /api/admin/reports` - Generate institutional reports

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### User Roles
- **student**: Can upload activities, generate portfolios
- **faculty**: Can approve/reject activities, view department data
- **admin**: Full system access, user management, reports

## 📁 File Uploads

### Supported File Types
- Images: JPEG, JPG, PNG
- Documents: PDF, DOC, DOCX

### File Limits
- Maximum file size: 10MB (configurable)
- Upload path: `./uploads/certificates/`

### File Access
- Files served at: `http://localhost:5000/uploads/certificates/filename`

## 🗄️ Database Initialization

The database schema is automatically created on first run with:
- Default activity categories
- Proper relationships and constraints
- Indexes for performance

### Default Activity Categories
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

## 🔧 Configuration

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_student_hub
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### API Testing
Use tools like Postman or curl to test endpoints:

```bash
# Register a student
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "role": "student",
    "firstName": "John",
    "lastName": "Doe",
    "studentId": "STU001",
    "department": "Computer Science",
    "yearOfStudy": 3
  }'
```

## 🚀 Deployment

### Production Considerations
1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure SSL for database
4. Set up proper file storage (AWS S3, etc.)
5. Use process manager (PM2)
6. Set up monitoring and logging

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Performance

### Database Optimization
- Connection pooling
- Proper indexing
- Query optimization
- Prepared statements

### File Handling
- Stream-based uploads
- File size validation
- Secure file serving
- Cleanup of orphaned files

## 🔒 Security

### Implemented Security Measures
- Password hashing with bcrypt
- JWT token validation
- Role-based access control
- File type validation
- SQL injection prevention
- CORS configuration

### Security Best Practices
- Use HTTPS in production
- Regular security updates
- Input validation
- Rate limiting (recommended)
- Logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is developed for educational purposes as part of the Smart India Hackathon.

---

**Smart Student Hub Backend** - Empowering Education Through Technology 🎓✨
