/**
 * API Testing Examples
 * Examples showing how to call each API endpoint
 */

// ============================================
// CREATE USER
// ============================================

const createUserExample = async () => {
  const response = await fetch("http://localhost:3000/api/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fullName: "John Doe",
      email: "john@example.com",
      phone: "9876543210",
      gender: "Male",
      parentName: "Jane Doe",
      university: "Delhi University",
      college: "St. Stephen's College",
      degree: "B.Tech",
      department: "Computer Science",
      subject: "Software Engineering",
      semester: "6th",
      session: "2024-2025",
      registrationNumber: "REG123456",
      ActiveInternship: [{ internship: "Internship ID 1" }],
      ActiveCources: [{ course: "Course ID 1" }],
      emergencyName: "Jane Doe",
      emergencyNumber: "9876543210",
      relationship: "Mother",
    }),
  });

  const data = await response.json();
  console.log("User created:", data);
};

// ============================================
// GET ALL USERS
// ============================================

const getAllUsersExample = async () => {
  const response = await fetch("http://localhost:3000/api/user");
  const data = await response.json();
  console.log("All users:", data);
};

// ============================================
// GET SINGLE USER
// ============================================

const getUserByIdExample = async (userId) => {
  const response = await fetch(`http://localhost:3000/api/user?id=${userId}`);
  const data = await response.json();
  console.log("Single user:", data);
};

// ============================================
// UPDATE USER
// ============================================

const updateUserExample = async (userId) => {
  const response = await fetch(`http://localhost:3000/api/user?id=${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fullName: "John Updated",
      email: "john.updated@example.com",
    }),
  });

  const data = await response.json();
  console.log("User updated:", data);
};

// ============================================
// DELETE USER
// ============================================

const deleteUserExample = async (userId) => {
  const response = await fetch(`http://localhost:3000/api/user?id=${userId}`, {
    method: "DELETE",
  });

  const data = await response.json();
  console.log("User deleted:", data);
};

// ============================================
// CREATE ADMIN
// ============================================

const createAdminExample = async () => {
  const response = await fetch("http://localhost:3000/api/admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Admin User",
      email: "admin@example.com",
      mobile: "9876543210",
      password: "SecurePassword123",
      agreeTerms: true,
    }),
  });

  const data = await response.json();
  console.log("Admin created:", data);
};

// ============================================
// CREATE COURSE
// ============================================

const createCourseExample = async () => {
  const response = await fetch("http://localhost:3000/api/course", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "Web Development Basics",
      description:
        "Learn the fundamentals of web development with HTML, CSS, and JavaScript",
      shortDescription: "Web Dev Basics",
      category: "Web Development",
      difficultyLevel: "Beginner",
      thumbnail: "https://example.com/image.jpg",
      instructor: {
        adminId: "admin123",
        name: "John Instructor",
        email: "instructor@example.com",
        bio: "Experienced web developer",
        profileImage: "https://example.com/profile.jpg",
      },
      content: {
        modules: [
          {
            moduleId: "mod1",
            title: "HTML Basics",
            description: "Learn HTML fundamentals",
            order: 1,
            lessons: [
              {
                lessonId: "les1",
                title: "Introduction to HTML",
                description: "HTML intro",
                duration: 45,
                order: 1,
              },
            ],
          },
        ],
        videos: [
          {
            videoId: "vid1",
            title: "HTML Tutorial",
            url: "https://example.com/video.mp4",
            duration: 3600,
          },
        ],
      },
    }),
  });

  const data = await response.json();
  console.log("Course created:", data);
};

// ============================================
// GET COURSES BY CATEGORY
// ============================================

const getCoursesByCategoryExample = async () => {
  const response = await fetch(
    "http://localhost:3000/api/course?category=Web Development",
  );
  const data = await response.json();
  console.log("Courses by category:", data);
};

// ============================================
// CREATE INTERNSHIP
// ============================================

const createInternshipExample = async () => {
  const response = await fetch("http://localhost:3000/api/internship", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "Frontend Developer Internship",
      description: "Work on real-world projects with our development team",
      shortDescription: "Frontend Dev Internship",
      position: "Frontend Developer",
      department: "Engineering",
      internshipType: "Summer",
      mode: "Hybrid",
      thumbnail: "https://example.com/internship.jpg",
      company: {
        name: "Tech Company Inc",
        email: "careers@techcompany.com",
        phone: "1234567890",
        website: "https://techcompany.com",
        logo: "https://example.com/logo.jpg",
        description: "Leading tech company",
        location: {
          city: "Bangalore",
          state: "Karnataka",
          country: "India",
          address: "123 Tech Street",
        },
        industry: "Information Technology",
        companySize: "Large",
      },
      createdBy: {
        adminId: "admin123",
        name: "Admin Name",
        email: "admin@example.com",
        department: "HR",
      },
      duration: {
        startDate: "2024-06-01",
        endDate: "2024-07-31",
        durationInWeeks: 8,
      },
    }),
  });

  const data = await response.json();
  console.log("Internship created:", data);
};

// ============================================
// SUBMIT CONTACT FORM
// ============================================

const submitContactFormExample = async () => {
  const response = await fetch("http://localhost:3000/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fullName: "Jane Smith",
      email: "jane@example.com",
      phone: "9876543210",
      course: "B.Tech Computer Science",
      university: "Delhi University",
      college: "Hindu College",
      semester: "4th",
      message:
        "I am interested in your internship programs and would like more information.",
    }),
  });

  const data = await response.json();
  console.log("Contact submitted:", data);
};

// ============================================
// GET CONTACTS BY STATUS
// ============================================

const getContactsByStatusExample = async () => {
  const response = await fetch("http://localhost:3000/api/contact?status=New");
  const data = await response.json();
  console.log("New contacts:", data);
};

// ============================================
// UPDATE CONTACT STATUS
// ============================================

const updateContactStatusExample = async (contactId) => {
  const response = await fetch(
    `http://localhost:3000/api/contact?id=${contactId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "Responded",
      }),
    },
  );

  const data = await response.json();
  console.log("Contact updated:", data);
};

export {
  createUserExample,
  getAllUsersExample,
  getUserByIdExample,
  updateUserExample,
  deleteUserExample,
  createAdminExample,
  createCourseExample,
  getCoursesByCategoryExample,
  createInternshipExample,
  submitContactFormExample,
  getContactsByStatusExample,
  updateContactStatusExample,
};
