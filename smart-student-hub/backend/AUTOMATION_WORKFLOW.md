# Automation Workflow Documentation

## Overview

This document describes the automated workflow that integrates **Built-in Sheets** with the Smart Student Hub platform. The system automatically creates and updates student activity sheets whenever faculty approves or rejects student activity submissions.

**✅ No Google Sheets Setup Required!**  
**✅ No External Dependencies!**  
**✅ Built-in, Shareable, Read-only Sheets!**

## Workflow Architecture

```
Faculty Action (Approve/Reject) 
    ↓
Activity Status Update in Database
    ↓
Automatic Webhook Trigger
    ↓
Data Extraction & Processing
    ↓
Built-in Sheets Integration
    ↓
Create/Update Student Sheet
```

## Components

### 1. Built-in Sheets Service (`services/builtinSheets.js`)
- **Purpose**: Manages built-in student activity sheets
- **Features**:
  - Automatic sheet creation for new students
  - Data storage in local database
  - Share token generation for public access
  - Database integration with caching
  - Read-only sheet viewing

### 2. Webhook Routes (`routes/webhook.js`)
- **Purpose**: Handles webhook requests and data processing
- **Endpoints**:
  - `POST /api/webhook/project-status` - Main webhook endpoint
  - `POST /api/webhook/test` - Test endpoint with sample data
  - `GET /api/webhook/health` - Health check endpoint

### 3. Faculty Integration (`routes/activities.js`)
- **Purpose**: Integrates webhook trigger with faculty approval workflow
- **Trigger Point**: Activity approval/rejection endpoint (`PUT /activities/:id/approve`)

### 4. Database Schema
- **New Table**: `student_spreadsheets`
  - Tracks Google Sheets spreadsheet IDs for each student
  - Prevents duplicate spreadsheet creation
  - Stores spreadsheet URLs for easy access

## Data Flow

### 1. Trigger Event
When faculty approves or rejects a student activity:
- Activity status is updated in the database
- Webhook is automatically triggered

### 2. Data Processing
The system extracts the following fields:
- `student_name`: Full name of the student
- `project_url`: GitHub URL or certificate URL
- `course_name`: Activity category or course name
- `status`: "approved" or "rejected"
- `faculty_name`: Name of the faculty who approved/rejected
- `certificate_id`: Activity ID as certificate identifier
- `validation_score`: Currently empty (can be populated later)
- `readable_date`: Human-readable date of approval/rejection
- `activity_type`: Type of activity (Project, Competition, etc.)
- `category`: Activity category

### 3. Google Sheets Integration
- **Sheet Creation**: If no spreadsheet exists for the student, creates a new one
- **Data Appending**: Adds the processed data as a new row
- **Formatting**: Applies header formatting with colors and bold text
- **Database Tracking**: Stores spreadsheet ID in the database

## Setup Instructions

### 1. Google Cloud Setup
Follow the detailed instructions in `GOOGLE_SHEETS_SETUP.md`:
1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create a Service Account
4. Generate and download JSON key file

### 2. Configuration
Place the service account JSON file as `config/google-credentials.json` or set the `GOOGLE_SERVICE_ACCOUNT_KEY` environment variable.

### 3. Database Migration
The system automatically creates the `student_spreadsheets` table when the server starts.

## API Endpoints

### Webhook Endpoint
```http
POST /api/webhook/project-status
Content-Type: application/json

{
  "student_name": "John Doe",
  "project_url": "https://github.com/johndoe/project",
  "course_name": "Computer Science",
  "status": "approved",
  "faculty_name": "Dr. Smith",
  "certificate_id": "CERT-12345",
  "validation_score": "95",
  "readable_date": "12/25/2024",
  "student_id": "CS2021001",
  "activity_type": "Project",
  "category": "Technical"
}
```

### Test Endpoint
```http
POST /api/webhook/test
```
Sends sample data to test the Google Sheets integration.

### Health Check
```http
GET /api/webhook/health
```
Returns the health status of the webhook service and Google Sheets configuration.

## Google Sheets Structure

Each student gets their own spreadsheet with the following columns:

| Column | Description |
|--------|-------------|
| Student Name | Full name of the student |
| Project URL | GitHub or certificate URL |
| Course Name | Activity category or course |
| Status | approved/rejected |
| Faculty Name | Name of approving faculty |
| Certificate ID | Activity ID for reference |
| Validation Score | Score or grade (if applicable) |
| Date | Date of approval/rejection |
| Activity Type | Type of activity |
| Category | Activity category |

## Error Handling

### Graceful Degradation
- If Google Sheets integration fails, the main approval process continues
- Errors are logged but don't affect the core functionality
- Failed webhook attempts can be retried manually

### Common Error Scenarios
1. **API Rate Limits**: Google Sheets API has rate limits
2. **Authentication Issues**: Invalid or expired service account keys
3. **Permission Errors**: Insufficient permissions for the service account
4. **Network Issues**: Connectivity problems with Google APIs

## Monitoring & Logging

### Log Messages
- `✅ Successfully updated Google Sheets for activity {id}`
- `❌ Webhook trigger failed: {error message}`
- `📊 Created new spreadsheet for {student}: {spreadsheet_id}`
- `📋 Found existing spreadsheet for student {id}: {spreadsheet_id}`

### Health Monitoring
Use the health check endpoint to monitor the service status:
```bash
curl http://localhost:5000/api/webhook/health
```

## Security Considerations

### Service Account Security
- Never commit `google-credentials.json` to version control
- Use environment variables in production
- Regularly rotate service account keys
- Limit service account permissions to minimum required

### Data Privacy
- Student data is only shared with Google Sheets as configured
- Spreadsheets are private by default
- Access can be controlled through Google Drive sharing settings

## Performance Optimization

### Caching
- Spreadsheet IDs are cached in memory for faster access
- Database queries are optimized with indexes

### Batch Processing
- Future enhancement: Process multiple updates in batches
- Reduce API calls through efficient data handling

## Troubleshooting

### Common Issues

1. **"Google Sheets API not initialized"**
   - Check service account credentials
   - Verify Google Sheets API is enabled
   - Ensure proper file permissions

2. **"Activity not found" errors**
   - Verify activity ID exists in database
   - Check database connectivity

3. **Spreadsheet creation failures**
   - Verify service account has Drive API access
   - Check Google API quotas and limits

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logs.

## Future Enhancements

### Planned Features
1. **Batch Processing**: Handle multiple activities at once
2. **Data Validation**: Validate data before sending to Google Sheets
3. **Retry Mechanism**: Automatic retry for failed webhook calls
4. **Dashboard Integration**: View spreadsheet links in the admin dashboard
5. **Custom Templates**: Allow custom spreadsheet templates
6. **Email Notifications**: Notify students when their data is updated

### Scalability Considerations
- Implement queue system for high-volume processing
- Add database connection pooling
- Consider using Google Sheets batch API for multiple updates

## Testing

### Manual Testing
1. Approve/reject a student activity through the faculty interface
2. Check if the corresponding Google Sheet is created/updated
3. Verify data accuracy in the spreadsheet

### Automated Testing
Use the test endpoint to verify the integration:
```bash
curl -X POST http://localhost:5000/api/webhook/test
```

### Health Check Testing
```bash
curl http://localhost:5000/api/webhook/health
```

## Support

For issues related to:
- **Google Sheets Integration**: Check `GOOGLE_SHEETS_SETUP.md`
- **Database Issues**: Verify database connectivity and table creation
- **API Errors**: Check server logs and error messages
- **Configuration**: Review environment variables and credentials

## Version History

- **v1.0**: Initial implementation with basic Google Sheets integration
- **v1.1**: Added database tracking for spreadsheet IDs
- **v1.2**: Implemented caching and performance optimizations
