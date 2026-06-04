# KpInterns Backend - Complete API Documentation

## Overview

This document provides complete information about all CRUD API endpoints for the KpInterns backend. All APIs are built using your existing models and MongoDB with Mongoose.

## Quick Start

### Prerequisites

- MongoDB URI configured in `.env.local` (✅ Already configured)
- Cloudinary credentials configured in `.env.local` (✅ Already configured)
- Node.js server running: `npm run dev`

### Expected Terminal Output on Startup

When you start the server with `npm run dev`, you should see:

```
✅ MongoDB Connection Successful!
📊 Connected to: cluster0.tlt1vvd.mongodb.net/KpInterns
⏰ Connection Time: [Current DateTime]

✅ Cloudinary Connection Successful!
☁️  Cloud Name: dnbg1n4aa
⏰ Configuration Time: [Current DateTime]
```

This confirms both MongoDB and Cloudinary are properly connected.

---

## API Endpoints Summary

### Base URL: `http://localhost:3000/api`

| Model          | GET           | POST | PUT | DELETE |
| -------------- | ------------- | ---- | --- | ------ |
| **User**       | `/user`       | ✅   | ✅  | ✅     |
| **Admin**      | `/admin`      | ✅   | ✅  | ✅     |
| **Course**     | `/course`     | ✅   | ✅  | ✅     |
| **Internship** | `/internship` | ✅   | ✅  | ✅     |
| **Contact**    | `/contact`    | ✅   | ✅  | ✅     |

---

## Detailed API Documentation

### 1️⃣ USER API

#### Get All Users

```http
GET /api/user
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "gender": "Male",
      "university": "Delhi University",
      "college": "St. Stephen's College",
      "degree": "B.Tech",
      "department": "Computer Science",
      "semester": "6th",
      "session": "2024-2025",
      "registrationNumber": "REG123456",
      "createdAt": "2024-06-04T10:00:00Z",
      "updatedAt": "2024-06-04T10:00:00Z"
    }
  ],
  "total": 1
}
```

#### Get Single User

```http
GET /api/user?id=507f1f77bcf86cd799439011
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    /* user object */
  }
}
```

#### Create User

```http
POST /api/user
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "gender": "Male",
  "parentName": "Jane Doe",
  "university": "Delhi University",
  "college": "St. Stephen's College",
  "degree": "B.Tech",
  "department": "Computer Science",
  "subject": "Software Engineering",
  "semester": "6th",
  "session": "2024-2025",
  "registrationNumber": "REG123456",
  "ActiveInternship": [{ "internship": "internship_id" }],
  "ActiveCources": [{ "course": "course_id" }],
  "emergencyName": "Jane Doe",
  "emergencyNumber": "9876543210",
  "relationship": "Mother"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    /* created user object */
  }
}
```

#### Update User

```http
PUT /api/user?id=507f1f77bcf86cd799439011
Content-Type: application/json

{
  "fullName": "Jane Doe Updated",
  "email": "jane.updated@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    /* updated user object */
  }
}
```

#### Delete User

```http
DELETE /api/user?id=507f1f77bcf86cd799439011
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    /* deleted user object */
  }
}
```

---

### 2️⃣ ADMIN API

#### Get All Admins

```http
GET /api/admin
```

**Note:** Passwords are excluded from responses for security.

#### Get Single Admin

```http
GET /api/admin?id=507f1f77bcf86cd799439011
```

#### Create Admin

```http
POST /api/admin
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "mobile": "9876543210",
  "password": "SecurePassword123",
  "agreeTerms": true
}
```

#### Update Admin

```http
PUT /api/admin?id=507f1f77bcf86cd799439011
Content-Type: application/json

{
  "name": "Updated Admin Name",
  "verified": true
}
```

#### Delete Admin

```http
DELETE /api/admin?id=507f1f77bcf86cd799439011
```

---

### 3️⃣ COURSE API

#### Get All Courses

```http
GET /api/course
```

#### Get Course by ID

```http
GET /api/course?id=507f1f77bcf86cd799439011
```

#### Get Courses by Category

```http
GET /api/course?category=Web Development
```

**Available Categories:**

- Web Development
- Mobile Development
- Data Science
- Machine Learning
- Cloud Computing
- DevOps
- UI/UX Design
- Digital Marketing
- Business
- Other

#### Create Course

```http
POST /api/course
Content-Type: application/json

{
  "title": "Web Development Basics",
  "description": "Learn the fundamentals of web development",
  "shortDescription": "Web Dev Basics",
  "category": "Web Development",
  "difficultyLevel": "Beginner",
  "thumbnail": "https://example.com/image.jpg",
  "instructor": {
    "adminId": "admin123",
    "name": "John Instructor",
    "email": "instructor@example.com",
    "bio": "Experienced web developer",
    "profileImage": "https://example.com/profile.jpg"
  },
  "content": {
    "modules": [
      {
        "moduleId": "mod1",
        "title": "HTML Basics",
        "description": "Learn HTML fundamentals",
        "order": 1,
        "lessons": [
          {
            "lessonId": "les1",
            "title": "Intro to HTML",
            "description": "HTML intro",
            "duration": 45,
            "order": 1
          }
        ]
      }
    ],
    "videos": [
      {
        "videoId": "vid1",
        "title": "HTML Tutorial",
        "url": "https://example.com/video.mp4",
        "duration": 3600
      }
    ]
  }
}
```

#### Update Course

```http
PUT /api/course?id=507f1f77bcf86cd799439011
Content-Type: application/json

{
  "title": "Updated Course Title",
  "difficultyLevel": "Intermediate"
}
```

#### Delete Course

```http
DELETE /api/course?id=507f1f77bcf86cd799439011
```

---

### 4️⃣ INTERNSHIP API

#### Get All Internships

```http
GET /api/internship
```

#### Get Internship by ID

```http
GET /api/internship?id=507f1f77bcf86cd799439011
```

#### Get Internships by Position

```http
GET /api/internship?position=Frontend Developer
```

#### Create Internship

```http
POST /api/internship
Content-Type: application/json

{
  "title": "Frontend Developer Internship",
  "description": "Work on real-world projects with our development team",
  "shortDescription": "Frontend Dev Internship",
  "position": "Frontend Developer",
  "department": "Engineering",
  "internshipType": "Summer",
  "mode": "Hybrid",
  "thumbnail": "https://example.com/internship.jpg",
  "company": {
    "name": "Tech Company Inc",
    "email": "careers@techcompany.com",
    "phone": "1234567890",
    "website": "https://techcompany.com",
    "logo": "https://example.com/logo.jpg",
    "description": "Leading tech company",
    "location": {
      "city": "Bangalore",
      "state": "Karnataka",
      "country": "India",
      "address": "123 Tech Street"
    },
    "industry": "Information Technology",
    "companySize": "Large"
  },
  "createdBy": {
    "adminId": "admin123",
    "name": "Admin Name",
    "email": "admin@example.com",
    "department": "HR"
  },
  "duration": {
    "startDate": "2024-06-01",
    "endDate": "2024-07-31",
    "durationInWeeks": 8
  }
}
```

#### Update Internship

```http
PUT /api/internship?id=507f1f77bcf86cd799439011
Content-Type: application/json

{
  "position": "Senior Frontend Developer",
  "mode": "Online"
}
```

#### Delete Internship

```http
DELETE /api/internship?id=507f1f77bcf86cd799439011
```

---

### 5️⃣ CONTACT API

#### Get All Contacts

```http
GET /api/contact
```

**Contacts are sorted by newest first (createdAt descending)**

#### Get Contact by ID

```http
GET /api/contact?id=507f1f77bcf86cd799439011
```

#### Get Contacts by Status

```http
GET /api/contact?status=New
```

**Available Statuses:**

- New (default)
- Reviewed
- Responded
- Closed

#### Submit Contact Form

```http
POST /api/contact
Content-Type: application/json

{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "phone": "9876543210",
  "course": "B.Tech Computer Science",
  "university": "Delhi University",
  "college": "Hindu College",
  "semester": "4th",
  "message": "I am interested in your internship programs."
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Contact saved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "status": "New",
    "createdAt": "2024-06-04T10:00:00Z",
    "updatedAt": "2024-06-04T10:00:00Z"
  }
}
```

#### Update Contact Status

```http
PUT /api/contact?id=507f1f77bcf86cd799439011
Content-Type: application/json

{
  "status": "Responded"
}
```

#### Delete Contact

```http
DELETE /api/contact?id=507f1f77bcf86cd799439011
```

---

## Error Handling

All endpoints return appropriate HTTP status codes and error messages.

### Error Response Format

```json
{
  "error": "Error message",
  "details": "Additional technical details (optional)"
}
```

### Common HTTP Status Codes

| Status | Meaning                                 |
| ------ | --------------------------------------- |
| 200    | OK - Request successful                 |
| 201    | Created - Resource created successfully |
| 400    | Bad Request - Missing or invalid fields |
| 404    | Not Found - Resource doesn't exist      |
| 500    | Server Error - Internal server error    |

### Example Error Response

```json
{
  "error": "User with this email or phone already exists",
  "details": "Email: john@example.com already exists in database"
}
```

---

## Console Logs

### Connection Verification Messages

When you start `npm run dev`, watch your terminal for these messages:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ MongoDB Connection Successful!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Connected to: cluster0.tlt1vvd.mongodb.net/KpInterns
⏰ Connection Time: 6/4/2024, 3:30:45 PM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Cloudinary Connection Successful!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
☁️  Cloud Name: dnbg1n4aa
⏰ Configuration Time: 6/4/2024, 3:30:45 PM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Operation Logs

Each successful CRUD operation will log:

```
✅ User created successfully: 507f1f77bcf86cd799439011
✅ Course updated successfully: 507f1f77bcf86cd799439011
✅ Contact deleted successfully: 507f1f77bcf86cd799439011
```

---

## Testing the APIs

You can test the APIs using:

1. **Postman** - Import the endpoints and test them
2. **cURL** - Command-line testing
3. **Fetch API** - From browser console or frontend code
4. **VS Code REST Client** - Use `.rest` files

### Example cURL Command

```bash
curl -X POST http://localhost:3000/api/user \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "gender": "Male",
    "parentName": "Jane Doe",
    "university": "Delhi University",
    "college": "St. Stephen's College",
    "degree": "B.Tech",
    "department": "Computer Science",
    "subject": "Software Engineering",
    "semester": "6th",
    "session": "2024-2025",
    "registrationNumber": "REG123456",
    "emergencyName": "Jane Doe",
    "emergencyNumber": "9876543210",
    "relationship": "Mother"
  }'
```

---

## Important Notes

1. ✅ All APIs use your existing models as schemas
2. ✅ No separate schema files were created
3. ✅ All CRUD operations are fully functional
4. ✅ MongoDB and Cloudinary connections are verified on startup
5. ✅ Proper error handling and validation for all endpoints
6. ✅ Timestamps (createdAt, updatedAt) are automatically added
7. ✅ Query parameters are used for filtering and single-item retrieval
8. ✅ All sensitive data (passwords) are excluded from responses

---

## File Structure

```
src/
├── app/
│   └── api/
│       ├── user/route.js          (User CRUD)
│       ├── admin/route.js         (Admin CRUD)
│       ├── course/route.js        (Course CRUD)
│       ├── internship/route.js    (Internship CRUD)
│       └── contact/route.js       (Contact CRUD)
├── lib/
│   ├── mongodb.js                 (MongoDB connection with console logs)
│   ├── cloudinary.js              (Cloudinary config with console logs)
│   └── utils/
│       └── schemaBuilder.js       (Schema builder utility)
└── models/                        (Your existing models - used as schemas)
```

---

## Next Steps

1. Start the server: `npm run dev`
2. Watch for connection messages in the terminal
3. Test APIs using Postman, cURL, or Fetch
4. Check console logs for operation confirmations
5. Refer to `API_EXAMPLES.js` for code examples

---

**Status:** ✅ All CRUD APIs Ready to Use
**Database:** ✅ MongoDB Connected
**Cloud Storage:** ✅ Cloudinary Configured
