/\*\*

- KpInterns API Documentation
- Complete CRUD APIs for all models
-
- Base URL: http://localhost:3000/api
  \*/

// ============================================
// USER API ENDPOINTS
// ============================================

/\*
GET /user

- Get all users
- Response: { success: true, data: [...], total: number }

GET /user?id={userId}

- Get a specific user by ID
- Response: { success: true, data: { ...user } }

POST /user

- Create a new user
- Body: {
  fullName, email, phone, gender, parentName,
  university, college, degree, department, subject,
  semester, session, registrationNumber,
  ActiveInternship: [{internship: "..."}],
  ActiveCources: [{course: "..."}],
  emergencyName, emergencyNumber, relationship
  }
- Response: { success: true, message: "User created successfully", data: {...} }

PUT /user?id={userId}

- Update a user
- Body: { ...fields to update }
- Response: { success: true, message: "User updated successfully", data: {...} }

DELETE /user?id={userId}

- Delete a user
- Response: { success: true, message: "User deleted successfully" }
  \*/

// ============================================
// ADMIN API ENDPOINTS
// ============================================

/\*
GET /admin

- Get all admins (passwords excluded)
- Response: { success: true, data: [...], total: number }

GET /admin?id={adminId}

- Get a specific admin by ID (password excluded)
- Response: { success: true, data: {...} }

POST /admin

- Create a new admin
- Body: { name, email, mobile, password, agreeTerms }
- Response: { success: true, message: "Admin created successfully", data: {...} }

PUT /admin?id={adminId}

- Update an admin
- Body: { ...fields to update }
- Response: { success: true, message: "Admin updated successfully", data: {...} }

DELETE /admin?id={adminId}

- Delete an admin
- Response: { success: true, message: "Admin deleted successfully" }
  \*/

// ============================================
// COURSE API ENDPOINTS
// ============================================

/\*
GET /course

- Get all courses
- Response: { success: true, data: [...], total: number }

GET /course?id={courseId}

- Get a specific course by ID
- Response: { success: true, data: {...} }

GET /course?category={category}

- Get courses by category
- Categories: Web Development, Mobile Development, Data Science, Machine Learning,
  Cloud Computing, DevOps, UI/UX Design, Digital Marketing, Business, Other
- Response: { success: true, data: [...], total: number }

POST /course

- Create a new course
- Body: {
  title, description, category, thumbnail,
  difficultyLevel, instructor: { adminId, name, email, bio, profileImage },
  content: { modules: [...], videos: [...] }
  }
- Response: { success: true, message: "Course created successfully", data: {...} }

PUT /course?id={courseId}

- Update a course
- Body: { ...fields to update }
- Response: { success: true, message: "Course updated successfully", data: {...} }

DELETE /course?id={courseId}

- Delete a course
- Response: { success: true, message: "Course deleted successfully" }
  \*/

// ============================================
// INTERNSHIP API ENDPOINTS
// ============================================

/\*
GET /internship

- Get all internships
- Response: { success: true, data: [...], total: number }

GET /internship?id={internshipId}

- Get a specific internship by ID
- Response: { success: true, data: {...} }

GET /internship?position={position}

- Get internships by position
- Response: { success: true, data: [...], total: number }

POST /internship

- Create a new internship
- Body: {
  title, description, position, department, internshipType,
  mode, company: { name, email, phone, website, logo, ... },
  createdBy: { adminId, name, email, department },
  duration: { startDate, endDate }, ...
  }
- Response: { success: true, message: "Internship created successfully", data: {...} }

PUT /internship?id={internshipId}

- Update an internship
- Body: { ...fields to update }
- Response: { success: true, message: "Internship updated successfully", data: {...} }

DELETE /internship?id={internshipId}

- Delete an internship
- Response: { success: true, message: "Internship deleted successfully" }
  \*/

// ============================================
// CONTACT API ENDPOINTS
// ============================================

/\*
GET /contact

- Get all contacts (sorted by newest first)
- Response: { success: true, data: [...], total: number }

GET /contact?id={contactId}

- Get a specific contact by ID
- Response: { success: true, data: {...} }

GET /contact?status={status}

- Get contacts by status
- Status values: New, Reviewed, Responded, Closed
- Response: { success: true, data: [...], total: number }

POST /contact

- Create a new contact form submission
- Body: {
  fullName, email, phone, course, university,
  college, semester, message
  }
- Response: { success: true, message: "Contact saved successfully", data: {...} }

PUT /contact?id={contactId}

- Update a contact (e.g., change status)
- Body: { status: "Reviewed" or "Responded" or "Closed", ... }
- Response: { success: true, message: "Contact updated successfully", data: {...} }

DELETE /contact?id={contactId}

- Delete a contact
- Response: { success: true, message: "Contact deleted successfully" }
  \*/

// ============================================
// ERROR HANDLING
// ============================================

/\*
All endpoints return appropriate HTTP status codes:

- 200: Success (GET, PUT)
- 201: Created (POST)
- 400: Bad Request (missing/invalid fields)
- 404: Not Found (resource doesn't exist)
- 500: Server Error

Error Response Format:
{ error: "Error message", details: "Additional details" }
\*/

// ============================================
// CONNECTION STATUS
// ============================================

/\*
When the server starts, you should see in the terminal:

✅ MongoDB Connection Successful!

- Shows database connection details
- Displays connection timestamp

✅ Cloudinary Connection Successful!

- Shows cloud name configuration
- Displays configuration timestamp
  \*/

export default {};
