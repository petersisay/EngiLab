# EngiLab — Engineering Laboratory Learning & Management Platform

[![ASTU Engineering](https://img.shields.io/badge/ASTU-Engineering-blue.svg)](https://www.astu.edu.et)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite_%2B_Tailwind-06B6D4.svg)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_%2B_Express_%2B_MongoDB-2563EB.svg)](https://nodejs.org)
[![License: Institutional](https://img.shields.io/badge/License-ASTU_Academic-0F172A.svg)](#license)

**EngiLab** is a full-stack, enterprise-grade engineering laboratory learning and management platform built specifically for **Adama Science and Technology University (ASTU)**, Ethiopia.

The platform digitizes and streamlines university laboratory curricula, manual distribution, individual and group experimental report submissions, rubric-based grading, performance analytics, and institutional compliance.

Repository: [https://github.com/petersisay/EngiLab.git](https://github.com/petersisay/EngiLab.git)

---

## Supported Academic Departments

1. **Department of Electronics and Communication Engineering (ECE)**
   - Digital Signal Processing Lab
   - Embedded Systems & Microcontrollers Lab
   - Telecommunications, RF & Antenna Systems Lab
2. **Department of Electrical Power and Control Engineering (EPCE)**
   - Electrical Machines & Power Electronics Drives Lab
   - Power Systems Simulation & High Voltage Lab
   - Industrial Automation & Programmable Logic Controllers (PLC) Lab

---

## Four Dedicated Role-Based Dashboards

1. **Super Administrator Portal (`/admin`)**
   - University-wide academic governance and institutional metrics.
   - Cross-department oversight for ECE and EPCE.
   - Comprehensive audit log monitoring for administrative compliance.
   - Academic calendar (academic years and terms) management.

2. **Department Administrator Portal (`/department`)**
   - Scoped departmental curriculum and course management.
   - Faculty and course instructor rosters.
   - Enrolled student directories and departmental laboratory facility status.

3. **Instructor Teaching Studio (`/instructor`)**
   - Laboratory exercise authoring with safety guidelines, manuals, and rubric criteria.
   - Interactive submission queue with live student report status.
   - Real-time grading studio with score calculation, rubric points, and qualitative feedback.

4. **Student Laboratory Workspace (`/student`)**
   - Enrolled engineering courses and upcoming experiment deadlines.
   - Digital laboratory manuals and reference datasheets.
   - Laboratory report submission studio (supporting individual and group submissions).
   - Grade and evaluation viewer with instructor feedback and areas for improvement.

---

## Architectural Highlights

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React icons, Framer Motion.
- **Backend:** Node.js, Express.js (CommonJS), MongoDB with Mongoose ODM, Helmet, CORS, Morgan.
- **Authentication:** Dual-mode authentication supporting secure, HTTP-only JWT cookies (`engilab_access_token`, `engilab_refresh_token`) and Authorization Bearer headers for API clients.
- **Security & Authorization:** Role-based access control (`SUPER_ADMIN`, `DEPARTMENT_ADMIN`, `INSTRUCTOR`, `STUDENT`), departmental boundary isolation middleware, rate limiting, and parameter validation.
- **Audit Ledger:** Centralized tracking of security and academic operations (`AuditLog`).
- **Real Data Integrity:** Zero fake hardcoded student statistics; all dashboard charts, counts, and states reflect persisted database records with clean, meaningful empty states.

---

## Project Structure

```text
EngiLab/
├── client/                                 # Frontend Application (React 18 + Vite + Tailwind CSS)
│   ├── public/
│   │   ├── engilab-logo.png               # Official EngiLab logo
│   │   └── engilab-hero-bg.png            # Official illuminated circuit hero background
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── Navbar.jsx             # Responsive navigation with role indicators
│   │   │       ├── Footer.jsx             # ASTU university institutional footer
│   │   │       ├── Sidebar.jsx            # Dynamic role-adaptive sidebar navigation
│   │   │       ├── DashboardLayout.jsx    # Unified dashboard layout with mobile drawer
│   │   │       └── ProtectedRoute.jsx     # Route protection & role redirection guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx            # User authentication state provider
│   │   ├── pages/
│   │   │   ├── public/LandingPage.jsx     # Modern ASTU landing page
│   │   │   ├── auth/LoginPage.jsx         # Sign in with quick-fill demo accounts
│   │   │   ├── auth/RegisterPage.jsx      # Student registration with department selection
│   │   │   ├── admin/AdminDashboard.jsx   # Super Admin Portal
│   │   │   ├── department/DepartmentDashboard.jsx  # Department Admin Portal
│   │   │   ├── instructor/InstructorDashboard.jsx  # Instructor Studio & Grading
│   │   │   └── student/StudentDashboard.jsx        # Student Workspace & Report Submission
│   │   ├── services/
│   │   │   └── api.js                     # Preconfigured Axios client with cookie credentials
│   │   ├── App.jsx                        # Complete client routing tree
│   │   ├── main.jsx                       # React DOM entrypoint
│   │   └── index.css                      # Tailwind styling & glassmorphism utilities
│   ├── index.html                         # Root HTML document with typography
│   ├── tailwind.config.js                 # EngiLab palette (#0F172A, #2563EB, #06B6D4)
│   ├── vite.config.js                     # Vite build configuration and API proxy
│   ├── vercel.json                        # Vercel SPA routing rewrite rules
│   └── package.json
│
├── server/                                 # Backend API Service (Node.js + Express)
│   ├── src/
│   │   ├── app.js                         # Express app with v1 routes and cookie parser
│   │   ├── server.js                      # HTTP server startup & graceful shutdown
│   │   ├── config/
│   │   │   ├── env.js                     # Centralized environment variable validation
│   │   │   ├── db.js                      # MongoDB connection module
│   │   │   └── seed.js                    # Database seeder for ASTU departments & admin
│   │   ├── controllers/
│   │   │   ├── auth.controller.js         # Authentication & user profile
│   │   │   ├── user.controller.js         # User directory & role management
│   │   │   ├── department.controller.js   # Academic department operations
│   │   │   ├── academic.controller.js     # Years, terms, courses, enrollments
│   │   │   ├── exercise.controller.js     # Laboratory exercise authoring & publishing
│   │   │   ├── submission.controller.js   # Individual & team report filing
│   │   │   ├── grade.controller.js        # Rubric scoring & student feedback
│   │   │   ├── resource.controller.js     # Lab manuals, datasheets, simulation tools
│   │   │   ├── communication.controller.js# Notifications & announcements
│   │   │   └── admin.controller.js        # Institutional analytics & audit querying
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js         # JWT cookie & header verification
│   │   │   ├── role.middleware.js         # Role authorization factory
│   │   │   ├── department.middleware.js   # Department boundary segregation
│   │   │   ├── error.middleware.js        # Centralized error handler
│   │   │   ├── notFound.middleware.js     # 404 handler
│   │   │   ├── rateLimiter.middleware.js  # Security rate limiting
│   │   │   └── validate.middleware.js     # Request payload validation
│   │   ├── models/                        # 14 Mongoose academic and security schemas
│   │   └── utils/
│   │       ├── apiError.js                # Custom ApiError class
│   │       ├── apiResponse.js             # Standardized JSON response formatter
│   │       └── token.js                   # JWT generation & cookie helper
│   ├── test/
│   │   └── workflow.test.js               # End-to-end academic pipeline verification
│   └── package.json
└── README.md
```

---

## Local Development & Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MongoDB instance (Local or MongoDB Atlas cluster)

### 1. Backend Setup
```bash
cd server
npm install
cp .env.example .env

# Edit .env with your MongoDB Atlas URI and JWT secrets
# Then initialize the database with ASTU departments and super admin:
node src/config/seed.js

# Start the development server:
npm run dev
# Server will listen on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd ../client
npm install
cp .env.example .env

# Start the Vite development server:
npm run dev
# Client will be accessible at http://localhost:5173
```

---

## Default Seeded Accounts for Testing

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@engilab.astu.edu.et` | `Admin@EngiLab` | Cross-Institutional |
| **ECE Instructor** | `dawit.kebede@astu.edu.et` | `Instructor@2025!` | ECE Department |
| **EPCE Instructor** | `alemayehu.tadesse@astu.edu.et` | `Instructor@2025!` | EPCE Department |

*(Students can register immediately via `/register` with any student ID number and department selection).*

---

## Automated Verification

To run the automated academic workflow test suite verifying environment validation, response formatting, JWT token decryption, model schemas, and late submission calculations:

```bash
cd server
node test/workflow.test.js
```

---

## License

Developed for the School of Electrical Engineering & Computing at **Adama Science and Technology University (ASTU)**.
All rights reserved.
