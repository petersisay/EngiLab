# EngiLab — Engineering Laboratory Learning & Management Platform

EngiLab is a specialized, web-based engineering laboratory learning and management platform designed for academic institutions. The platform streamlines laboratory workflows, manual distribution, report submissions, rubric-based assessments, and academic progress tracking across engineering departments.

Repository: [https://github.com/petersisay/EngiLab.git](https://github.com/petersisay/EngiLab.git)

> **Project Status:** Under Active Development. Core architecture and initial modules are currently being bootstrapped. Features described below represent the planned capabilities and design specifications.

---

## Institutional Context

EngiLab is developed for **Adama Science and Technology University (ASTU)** to serve its undergraduate engineering laboratory curricula.

The initial rollout targets two key engineering departments:
1. **Department of Electronics and Communication Engineering (ECE)**
2. **Department of Electrical Power and Control Engineering (EPCE)**

Each department operates distinct laboratory courses, apparatus guidelines, and scheduling constraints, while adhering to shared institutional evaluation standards.

---

## Problem Statement

Engineering laboratory courses traditionally face operational challenges:
- **Disjointed Materials:** Laboratory manuals, safety guidelines, and reference sheets are often dispersed across physical handouts or unorganized file shares.
- **Manual Submission Overhead:** Managing physical or ad-hoc digital report submissions for large student cohorts leads to submission tracking issues and delays.
- **Group Accountability Gaps:** Engineering labs frequently involve paired or group experiments, making it difficult to systematically track individual member participation and group submissions.
- **Feedback Lag:** Instructors lack a centralized portal to provide structured, rubric-based feedback and timely marks back to students.
- **Visibility & Audit Deficits:** Department heads lack aggregate, real-time visibility into lab exercise completion rates, grading timelines, and course-level academic progress.

---

## Project Objectives

- **Centralize Laboratory Resources:** Provide a structured digital repository for lab sheets, safety protocols, and experiment guides organized by department, semester, and course.
- **Streamline Submissions:** Support both individual and group lab report submissions with timestamping and status tracking.
- **Structured Assessment:** Deliver rubric-driven evaluation tools enabling instructors to provide actionable feedback and transparent marks.
- **Progress Tracking:** Give students and instructors clear analytics on completed experiments, pending tasks, and cumulative performance.
- **Maintain Institutional Integrity:** Enforce role-based access control, departmental boundary segregation, and comprehensive audit logs.
- **Software Focus:** Dedicated exclusively to academic laboratory management and workflow orchestration (no hardware sensors, IoT integrations, or simulated engineering computations).

---

## Planned Roles and Permissions

EngiLab employs Role-Based Access Control (RBAC) across four primary user tiers:

1. **`SUPER_ADMIN`**
   - System-wide administrative authority.
   - Manages institutional settings, department creation, and administrative user provisioning.
   - Inspects global audit logs and system health.

2. **`DEPARTMENT_ADMIN`**
   - Department-specific administration (ECE or EPCE).
   - Oversees departmental academic terms, semesters, course assignments, and instructor rosters.
   - Generates department-wide lab completion and assessment reports.

3. **`INSTRUCTOR`**
   - Manages assigned laboratory courses and student enrollments.
   - Publishes lab exercises, manuals, and submission deadlines.
   - Configures individual vs. group submission requirements.
   - Evaluates submissions, assigns marks, and provides qualitative feedback.

4. **`STUDENT`**
   - Enrolls in departmental laboratory courses.
   - Accesses lab manuals, schedules, and reference materials.
   - Forms lab groups (where permitted) and submits lab reports.
   - Reviews grades, instructor feedback, and personal completion progress.

---

## Planned Core Features

- **Identity & Access Management:** Secure JWT-based authentication, role-based authorization, and profile management.
- **Department & Academic Management:** Management of departments (ECE, EPCE), academic years, semesters, and course catalogs.
- **Laboratory Exercises & Resource Hub:** Course-level experiment guides, downloadable reference resources, and safety documentation.
- **Submission Management:** Individual and group-based report submission portals with deadline tracking and version history.
- **Assessment & Rubrics:** Instructor grading interfaces with customizable criteria, marking schemes, and student feedback.
- **Academic Progress Tracking:** Student dashboards displaying completed lab exercises, pending reports, and grade breakdowns.
- **Notifications & Communication:** System notifications for upcoming lab deadlines, submission receipts, and published grades.
- **Audit Logging:** Tamper-evident logging of critical administrative and academic transactions.

---

## Technology Stack

### Frontend
- **Framework & Runtime:** React 18
- **Build Tool:** Vite
- **Language:** JavaScript (ES6+ with JSX)
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Module System:** CommonJS (`require` / `module.exports`)
- **Database ODM:** Mongoose
- **Security:** Helmet, CORS, bcryptjs, jsonwebtoken

### Database & Storage
- **Database:** MongoDB Atlas (cloud-hosted document database)
- **Asset Storage:** Cloudinary (planned for cloud-based report PDF and file asset storage in a subsequent phase)

### Deployment Targets
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render

---

## Proposed Architecture

EngiLab maintains a decoupled client/server repository structure designed for separate deployments and independent scaling:

```text
EngiLab/
├── .gitignore                      # Repository ignore rules
├── README.md                       # Platform documentation & development roadmap
│
├── server/                         # Backend API (Node.js + Express + CommonJS)
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── app.js                  # Application setup & middleware
│       ├── server.js               # Entrypoint & database initialization
│       ├── config/                 # Database and service configurations
│       ├── middleware/             # Auth, RBAC, validation, error handlers
│       ├── utils/                  # Response formatters and error abstractions
│       └── modules/                # Feature modules (auth, users, courses, exercises, etc.)
│
└── client/                         # Frontend Application (React 18 + Vite + Tailwind CSS)
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx                 # Route definitions & provider tree
        ├── main.jsx                # DOM mount entrypoint
        ├── components/             # Reusable UI primitives
        ├── layouts/                # Role-specific layouts (Public, Dashboard)
        ├── pages/                  # Route views (Auth, Courses, Labs, Grades)
        ├── context/                # Auth and UI context providers
        └── services/               # Backend API integration services
```

---

## Development Roadmap

- [x] **Phase 1: Project Initialization & Inspection**
  - [x] Configure repository governance and root `.gitignore`.
  - [x] Document platform overview, institutional scope, and roadmap in `README.md`.
- [ ] **Phase 2: Backend Foundation**
  - [ ] Initialize `server/package.json` with scripts and core dependencies.
  - [ ] Configure environment variables template (`.env.example`).
  - [ ] Implement database connection module (`src/config/db.js`).
  - [ ] Create standardized error classes and response handlers.
  - [ ] Implement Express application bootstrap and server entrypoint.
- [ ] **Phase 3: Core Backend Modules**
  - [ ] Department, Semester, and Course schemas and controllers.
  - [ ] Authentication, user models, password hashing, and JWT middleware.
  - [ ] Role-based access control (RBAC).
- [ ] **Phase 4: Laboratory & Submission Workflow**
  - [ ] Lab exercise creation and resource management.
  - [ ] Group formation and membership management.
  - [ ] Report submission pipelines and deadline enforcement.
  - [ ] Assessment, grading, and rubric evaluation engine.
- [ ] **Phase 5: Frontend Bootstrap & UI Implementation**
  - [ ] Initialize Vite + React 18 client and configure Tailwind CSS.
  - [ ] Construct layouts, routing tables, and authentication context.
  - [ ] Develop student, instructor, and department admin dashboards.
  - [ ] Integrate API services with backend endpoints.
- [ ] **Phase 6: Cloudinary Integration, Testing & Deployment**
  - [ ] Cloudinary report attachment integration.
  - [ ] End-to-end workflow verification.
  - [ ] Deployment to Vercel (client) and Render (server).

---

## Installation and Setup

> **Notice:** Installation scripts and application source files are currently in the process of being initialized. Step-by-step setup instructions will become operational as corresponding directories are committed.

### Prerequisites (Planned)
- Node.js (v18+ recommended; developed with v24.x)
- npm (v9+ recommended; developed with v11.x)
- MongoDB Atlas connection string (or local MongoDB instance)

### Setup Steps (Forthcoming)
```bash
# Clone repository
git clone https://github.com/petersisay/EngiLab.git
cd EngiLab

# Backend setup (forthcoming upon server bootstrap)
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm run dev

# Frontend setup (forthcoming upon client bootstrap)
cd ../client
npm install
npm run dev
```

---

## Security & Environment Variable Guidelines

- **Zero Secret Commits:** Never commit actual `.env` files, API keys, or database credentials. Use `.env.example` templates with empty placeholders for documentation.
- **Authentication Security:** Passwords must be hashed using `bcryptjs` with appropriate work factors before persistence.
- **Token Security:** JWT tokens should have defined expiration lifetimes and be transmitted via secure headers.
- **Input Validation:** All incoming request payloads must be sanitized and validated at the controller/middleware level.

---

## License

This project is developed for educational and institutional laboratory management at Adama Science and Technology University (ASTU).
