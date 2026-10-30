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
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('[Seed] Connected to MongoDB.');

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

    // 2. Seed Super Admin
    const superAdminEmail = 'admin@engilab.astu.edu.et';
    let superAdmin = await User.findOne({ email: superAdminEmail });
    if (!superAdmin) {
      superAdmin = await User.create({
        firstName: 'System',
        lastName: 'Administrator',
        email: superAdminEmail,
        passwordHash: 'Admin@EngiLab2025!',
        role: 'SUPER_ADMIN',
        department: null,
        isActive: true,
        isEmailVerified: true
      });
      console.log(`[Seed] Created Super Admin: ${superAdminEmail}`);
    } else {
      console.log(`[Seed] Super Admin already exists: ${superAdminEmail}`);
    }

    // 3. Seed Instructors for ECE and EPCE
    const instructorsData = [
      {
        firstName: 'Dawit',
        lastName: 'Kebede',
        email: 'dawit.kebede@astu.edu.et',
        passwordHash: 'Instructor@2025!',
        role: 'INSTRUCTOR',
        department: departmentMap['ECE'],
        isActive: true
      },
      {
        firstName: 'Alemayehu',
        lastName: 'Tadesse',
        email: 'alemayehu.tadesse@astu.edu.et',
        passwordHash: 'Instructor@2025!',
        role: 'INSTRUCTOR',
        department: departmentMap['EPCE'],
        isActive: true
      }
    ];

    const instructorMap = {};
    for (const inst of instructorsData) {
      let user = await User.findOne({ email: inst.email });
      if (!user) {
        user = await User.create(inst);
        console.log(`[Seed] Created Instructor: ${user.email}`);
      }
      instructorMap[inst.email] = user._id;
    }

    // 4. Seed Academic Year & Semester
    let currentYear = await AcademicYear.findOne({ year: '2024/2025' });
    if (!currentYear) {
      currentYear = await AcademicYear.create({
        year: '2024/2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        isCurrent: true
      });
      console.log(`[Seed] Created Academic Year: ${currentYear.year}`);
    }

    let currentSemester = await Semester.findOne({
      name: 'Semester I',
      academicYear: currentYear._id
    });
    if (!currentSemester) {
      currentSemester = await Semester.create({
        name: 'Semester I',
        academicYear: currentYear._id,
        term: 'SEMESTER_1',
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
        credits: 3,
        coordinator: instructorMap['dawit.kebede@astu.edu.et'],
        instructors: [instructorMap['dawit.kebede@astu.edu.et']],
        isActive: true
      },
      {
        code: 'EPCE3201',
        title: 'Power Electronics and Drive Systems Laboratory',
        description:
          'Hands-on experimental study of rectifiers, DC-DC converters, inverters, motor speed controllers, and power semiconductor switching dynamics.',
        department: departmentMap['EPCE'],
        semester: currentSemester._id,
        credits: 3,
        coordinator: instructorMap['alemayehu.tadesse@astu.edu.et'],
        instructors: [instructorMap['alemayehu.tadesse@astu.edu.et']],
        isActive: true
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
        exerciseNumber: 'Lab 01',
        weekNumber: 2,
        course: courseMap['ECE3101'],
        description:
          'Generation of discrete-time unit step, impulse, and sinusoidal sequences. Implementation of linear convolution and difference equations.',
        objectives: [
          'Generate standard discrete-time signals mathematically and computationally',
          'Implement linear convolution and verify using discrete-time Fourier transform',
          'Evaluate stability and causality of discrete-time systems'
        ],
        equipmentRequired: ['MATLAB / Python (NumPy/SciPy)', 'Personal Workstation'],
        safetyGuidelines: 'Follow laboratory computing guidelines. Backup all source code.',
        procedureSteps: [
          'Synthesize elementary signals with varying sampling rates',
          'Perform manual and programmatic discrete convolution',
          'Plot frequency responses and verify poles and zeros'
        ],
        manualUrl: 'https://example.com/manuals/ece3101-lab1.pdf',
        submissionType: 'INDIVIDUAL',
        maxScore: 100,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        lateSubmissionAllowed: true,
        latePenaltyPercent: 5,
        isPublished: true,
        createdBy: instructorMap['dawit.kebede@astu.edu.et']
      },
      {
        title: 'Power Lab 1: Single-Phase Controlled Bridge Rectifier Dynamics',
        exerciseNumber: 'Lab 01',
        weekNumber: 3,
        course: courseMap['EPCE3201'],
        description:
          'Investigation of firing angle modulation on output DC voltage, ripple factor, and total harmonic distortion (THD) under resistive and inductive loads.',
        objectives: [
          'Construct a single-phase fully-controlled thyristor bridge circuit',
          'Analyze gate triggering angles from 0 to 180 degrees',
          'Measure input power factor, voltage ripple, and load current waveforms'
        ],
        equipmentRequired: [
          'Power Electronics Modular Bench',
          'Digital Storage Oscilloscope (DSO)',
          'SCR Thyristor Bridge Module',
          'RL Load Bank'
        ],
        safetyGuidelines:
          'High voltage circuits present. Ensure primary breaker is off prior to wiring. Use insulated probes at all times.',
        procedureSteps: [
          'Verify circuit schematic and ground connections with instructor',
          'Energize supply and record DC voltage at firing angles alpha = 30, 60, 90, 120',
          'Capture oscilloscope waveforms for load voltage and thyristor anode-cathode voltage'
        ],
        manualUrl: 'https://example.com/manuals/epce3201-lab1.pdf',
        submissionType: 'GROUP',
        maxScore: 100,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        lateSubmissionAllowed: true,
        latePenaltyPercent: 5,
        isPublished: true,
        createdBy: instructorMap['alemayehu.tadesse@astu.edu.et']
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
    await mongoose.disconnect();
    console.log('[Seed] Disconnected from MongoDB.');
  }
};

// Execute if run directly from CLI
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
