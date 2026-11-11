const mongoose = require('mongoose');
const env = require('./env');
const Department = require('../models/department.model');
const User = require('../models/user.model');
const AcademicYear = require('../models/academicYear.model');
const Semester = require('../models/semester.model');
const Course = require('../models/course.model');
const LaboratoryExercise = require('../models/exercise.model');

/**
 * Database seeder script to initialize ASTU engineering departments,
 * super admin, academic calendar, sample courses, and lab exercises.
 */
const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('[Seed] Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI || env.MONGODB_URI);
      console.log('[Seed] Connected to MongoDB.');
    }

    // 1. Seed Departments (ECE & EPCE)
    const departmentsData = [
      {
        name: 'Electronics and Communication Engineering',
        code: 'ECE',
        slug: 'ece',
        description:
          'Department of Electronics and Communication Engineering at ASTU focusing on telecommunications, embedded systems, microelectronics, and signal processing.',
        labs: ['Embedded Systems & IoT Lab', 'Digital Signal Processing Lab', 'Telecommunications & RF Lab'],
        isActive: true
      },
      {
        name: 'Electrical Power and Control Engineering',
        code: 'EPCE',
        slug: 'epce',
        description:
          'Department of Electrical Power and Control Engineering at ASTU specializing in power systems, industrial automation, control theory, and renewable energy.',
        labs: ['Electric Machines Lab', 'Power Systems Simulation Lab', 'Industrial Automation & PLC Lab'],
        isActive: true
      }
    ];

    const departmentMap = {};
    for (const d of departmentsData) {
      let dept = await Department.findOne({ code: d.code });
      if (!dept) {
        dept = await Department.create(d);
        console.log(`[Seed] Created department: ${dept.code}`);
      } else {
        console.log(`[Seed] Department already exists: ${dept.code}`);
      }
      departmentMap[d.code] = dept._id;
    }

    // 2. Seed Super Admin (Matching README.md Table Credentials)
    const superAdminEmail = 'admin@engilab.astu.edu.et';
    let superAdmin = await User.findOne({ email: superAdminEmail });
    if (!superAdmin) {
      superAdmin = await User.create({
        name: 'System Administrator',
        email: superAdminEmail,
        password: 'Admin@EngiLab',
        role: 'SUPER_ADMIN',
        department: null,
        status: 'ACTIVE',
        isEmailVerified: true
      });
      console.log(`[Seed] Created Super Admin: ${superAdminEmail}`);
    } else {
      superAdmin.password = 'Admin@EngiLab';
      superAdmin.role = 'SUPER_ADMIN';
      superAdmin.status = 'ACTIVE';
      superAdmin.isEmailVerified = true;
      await superAdmin.save();
      console.log(`[Seed] Synchronized Super Admin password: ${superAdminEmail}`);
    }

    // 3. Seed Default Instructors from README.md Table
    // Students are NOT pre-seeded; students register individually via /register
    const tableInstructors = [
      {
        name: 'Dawit Kebede',
        email: 'dawit.kebede@astu.edu.et',
        password: 'Instructor@2025!',
        role: 'INSTRUCTOR',
        department: departmentMap['ECE'],
        status: 'ACTIVE',
        isEmailVerified: true
      },
      {
        name: 'Alemayehu Tadesse',
        email: 'alemayehu.tadesse@astu.edu.et',
        password: 'Instructor@2025!',
        role: 'INSTRUCTOR',
        department: departmentMap['EPCE'],
        status: 'ACTIVE',
        isEmailVerified: true
      }
    ];

    const instructorMap = {};
    for (const u of tableInstructors) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create(u);
        console.log(`[Seed] Created ${user.role}: ${user.email}`);
      } else {
        user.password = u.password;
        user.role = u.role;
        user.department = u.department;
        user.status = 'ACTIVE';
        user.isEmailVerified = true;
        await user.save();
        console.log(`[Seed] Synchronized ${user.role}: ${user.email}`);
      }
      instructorMap[u.email] = user._id;
    }

    // 4. Seed Academic Year & Semester
    let currentYear = await AcademicYear.findOne({ code: 'AY-2024-2025' });
    if (!currentYear) {
      currentYear = await AcademicYear.create({
        name: '2024/2025 Academic Year',
        code: 'AY-2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        isCurrent: true
      });
      console.log(`[Seed] Created Academic Year: ${currentYear.name}`);
    }

    let currentSemester = await Semester.findOne({
      name: 'Semester I',
      academicYear: currentYear._id
    });
    if (!currentSemester) {
      currentSemester = await Semester.create({
        name: 'Semester I',
        academicYear: currentYear._id,
        startDate: new Date('2024-09-15'),
        endDate: new Date('2025-02-15'),
        isCurrent: true
      });
      console.log(`[Seed] Created Semester: ${currentSemester.name}`);
    }

    // 5. Seed Core Courses
    const coursesData = [
      {
        code: 'ECE3101',
        title: 'Digital Signal Processing Laboratory',
        description:
          'Practical laboratory investigations of FIR/IIR filter design, Fast Fourier Transform (FFT), audio signal analysis, and real-time DSP implementations.',
        department: departmentMap['ECE'],
        semester: currentSemester._id,
        academicYear: currentYear._id,
        credits: 3,
        instructors: [instructorMap['dawit.kebede@astu.edu.et']],
        status: 'ACTIVE'
      },
      {
        code: 'EPCE3201',
        title: 'Power Electronics and Drive Systems Laboratory',
        description:
          'Hands-on experimental study of rectifiers, DC-DC converters, inverters, motor speed controllers, and power semiconductor switching dynamics.',
        department: departmentMap['EPCE'],
        semester: currentSemester._id,
        academicYear: currentYear._id,
        credits: 3,
        instructors: [instructorMap['alemayehu.tadesse@astu.edu.et']],
        status: 'ACTIVE'
      }
    ];

    const courseMap = {};
    for (const c of coursesData) {
      let course = await Course.findOne({ code: c.code, semester: c.semester });
      if (!course) {
        course = await Course.create(c);
        console.log(`[Seed] Created Course: ${course.code} - ${course.title}`);
      }
      courseMap[c.code] = course._id;
    }

    // 6. Seed Sample Lab Exercises
    const exercisesData = [
      {
        title: 'DSP Lab 1: Discrete-Time Signals and Systems in MATLAB/Python',
        course: courseMap['ECE3101'],
        department: departmentMap['ECE'],
        instructor: instructorMap['dawit.kebede@astu.edu.et'],
        description:
          'Generation of discrete-time unit step, impulse, and sinusoidal sequences. Implementation of linear convolution and difference equations.',
        instructions: 'Synthesize elementary signals with varying sampling rates. Perform manual and programmatic discrete convolution.',
        objectives: [
          'Generate standard discrete-time signals mathematically and computationally',
          'Implement linear convolution and verify using discrete-time Fourier transform',
          'Evaluate stability and causality of discrete-time systems'
        ],
        submissionType: 'INDIVIDUAL',
        maxScore: 100,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        status: 'PUBLISHED'
      },
      {
        title: 'Power Lab 1: Single-Phase Controlled Bridge Rectifier Dynamics',
        course: courseMap['EPCE3201'],
        department: departmentMap['EPCE'],
        instructor: instructorMap['alemayehu.tadesse@astu.edu.et'],
        description:
          'Investigation of firing angle modulation on output DC voltage, ripple factor, and total harmonic distortion (THD) under resistive and inductive loads.',
        instructions: 'Verify circuit schematic and ground connections with instructor. Record DC voltage at firing angles alpha = 30, 60, 90, 120.',
        objectives: [
          'Construct a single-phase fully-controlled thyristor bridge circuit',
          'Analyze gate triggering angles from 0 to 180 degrees',
          'Measure input power factor, voltage ripple, and load current waveforms'
        ],
        submissionType: 'GROUP',
        maxScore: 100,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'PUBLISHED'
      }
    ];

    for (const ex of exercisesData) {
      let exercise = await LaboratoryExercise.findOne({ title: ex.title, course: ex.course });
      if (!exercise) {
        exercise = await LaboratoryExercise.create(ex);
        console.log(`[Seed] Created Exercise: ${exercise.title}`);
      }
    }

    console.log('[Seed] Database initialization completed successfully.');
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
  } finally {
    if (require.main === module) {
      await mongoose.disconnect();
      console.log('[Seed] Disconnected from MongoDB.');
    }
  }
};

// Execute if run directly from CLI
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
