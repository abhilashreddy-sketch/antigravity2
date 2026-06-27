const {
  sequelize,
  User,
  Project,
  Site,
  ProgressReport,
  SitePhoto,
  Material,
  LabourAttendance,
  Expense,
  Notification,
} = require('./models');

const seedDatabase = async () => {
  try {
    console.log('Synchronizing database models...');
    // Sync models (force true will recreate tables)
    await sequelize.sync({ force: true });
    console.log('Database synced successfully.');

    console.log('Seeding Users...');
    const admin = await User.create({
      name: 'Abhilash Admin',
      email: 'admin@tracker.com',
      password: 'Admin123!',
      role: 'admin',
      phone: '+155501001',
    });

    const manager = await User.create({
      name: 'Sarah Manager',
      email: 'manager@tracker.com',
      password: 'Manager123!',
      role: 'manager',
      phone: '+155501002',
    });

    const engineer = await User.create({
      name: 'John Engineer',
      email: 'engineer@tracker.com',
      password: 'Engineer123!',
      role: 'engineer',
      phone: '+155501003',
    });

    console.log('Seeding Projects...');
    const project1 = await Project.create({
      name: 'Downtown Commercial Complex',
      description: 'Construction of a modern 15-story mixed-use commercial office building and retail podium with underground parking.',
      budget: 12500000.00,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      status: 'active',
    });

    const project2 = await Project.create({
      name: 'Metropolitan Residential Towers',
      description: 'Development of three high-rise residential apartment towers containing 450 luxury units with community amenities.',
      budget: 8400000.00,
      startDate: '2026-03-01',
      endDate: '2027-06-30',
      status: 'active',
    });

    console.log('Seeding Sites...');
    const site1 = await Site.create({
      name: 'Downtown Complex - Foundation Works',
      location: 'Downtown Chicago (Loop Sector)',
      latitude: 41.8781,
      longitude: -87.6298,
      status: 'active',
      projectId: project1.id,
      engineerId: engineer.id,
    });

    const site2 = await Site.create({
      name: 'Downtown Complex - Tower A Framing',
      location: 'Downtown Chicago (North Block)',
      latitude: 41.8810,
      longitude: -87.6320,
      status: 'delayed', // Seeding as delayed to test risk alerting!
      projectId: project1.id,
      engineerId: engineer.id,
    });

    const site3 = await Site.create({
      name: 'Residential Towers - Site Excavation',
      location: 'Metropolitan Suburb Block 4',
      latitude: 42.0040,
      longitude: -87.8120,
      status: 'active',
      projectId: project2.id,
      engineerId: engineer.id,
    });

    console.log('Seeding Initial Site Materials...');
    // Site 1 Materials
    await Material.bulkCreate([
      { name: 'Cement', unit: 'Bags', received: 500, used: 320, balance: 180, siteId: site1.id },
      { name: 'Reinforcement Steel', unit: 'Tons', received: 80, used: 65, balance: 15, siteId: site1.id },
      { name: 'Coarse Aggregate', unit: 'Cum', received: 250, used: 210, balance: 40, siteId: site1.id },
      { name: 'Fine Sand', unit: 'Cum', received: 150, used: 120, balance: 30, siteId: site1.id },
    ]);

    // Site 2 Materials
    await Material.bulkCreate([
      { name: 'Structural Steel Columns', unit: 'Tons', received: 120, used: 98, balance: 22, siteId: site2.id },
      { name: 'Cement', unit: 'Bags', received: 300, used: 290, balance: 10, siteId: site2.id }, // Low stock alert!
      { name: 'Bolts & Connectors', unit: 'Boxes', received: 50, used: 46, balance: 4, siteId: site2.id }, // Low stock!
    ]);

    // Site 3 Materials
    await Material.bulkCreate([
      { name: 'Concrete Pipes (Drainage)', unit: 'Meters', received: 120, used: 50, balance: 70, siteId: site3.id },
      { name: 'Fuel (Excavator)', unit: 'Litres', received: 2000, used: 1600, balance: 400, siteId: site3.id },
    ]);

    console.log('Seeding Progress Reports...');
    // Historical dates
    const d1 = '2026-06-14';
    const d2 = '2026-06-15';
    const d3 = '2026-06-16'; // Yesterday
    const d4 = '2026-06-17'; // Today (matching context)

    // Site 1 Reports
    const rep1_1 = await ProgressReport.create({
      reportDate: d1,
      completionPercentage: 25,
      workDone: 'Completed site grading and layout verification. Initiated rebar placement for foundation slab.',
      remarks: 'Weather clear, work proceeding on pace.',
      flaggedDelay: false,
      siteId: site1.id,
      reporterId: engineer.id,
    });
    const rep1_2 = await ProgressReport.create({
      reportDate: d2,
      completionPercentage: 28,
      workDone: 'Continued rebar fixing for foundation raft. Received fresh steel reinforcement consignment.',
      remarks: 'Inspected by third party auditor, passed safety clearances.',
      flaggedDelay: false,
      siteId: site1.id,
      reporterId: engineer.id,
    });
    const rep1_3 = await ProgressReport.create({
      reportDate: d3,
      completionPercentage: 32,
      workDone: 'Commenced concrete pouring for central core raft. Poured 150 Cum concrete.',
      remarks: 'Concrete trucks delayed in traffic slightly, but pouring completed by late evening.',
      flaggedDelay: false,
      siteId: site1.id,
      reporterId: engineer.id,
    });

    // Add some site photo placeholders
    await SitePhoto.bulkCreate([
      { photoUrl: 'uploads/mock_foundation_1.jpg', progressReportId: rep1_1.id },
      { photoUrl: 'uploads/mock_foundation_2.jpg', progressReportId: rep1_2.id },
      { photoUrl: 'uploads/mock_foundation_3.jpg', progressReportId: rep1_3.id },
    ]);

    // Site 2 Reports (Delayed project)
    const rep2_1 = await ProgressReport.create({
      reportDate: d1,
      completionPercentage: 10,
      workDone: 'Completed anchor bolt assembly. Prepared crane erection bed.',
      remarks: 'Erection crane delayed by lease rental agency.',
      flaggedDelay: true,
      siteId: site2.id,
      reporterId: engineer.id,
    });
    const rep2_2 = await ProgressReport.create({
      reportDate: d2,
      completionPercentage: 12,
      workDone: 'Began crane setup. Heavy winds in afternoon halted assembly.',
      remarks: 'High wind speed alert. Safety first.',
      flaggedDelay: true,
      siteId: site2.id,
      reporterId: engineer.id,
    });
    const rep2_3 = await ProgressReport.create({
      reportDate: d3,
      completionPercentage: 14,
      workDone: 'Crane assembled. Commenced steel column framing. Progress slow due to severe workforce shortage.',
      remarks: 'Subcontractor crew short by 8 steel workers.',
      flaggedDelay: true,
      siteId: site2.id,
      reporterId: engineer.id,
    });

    // Site 3 Reports
    await ProgressReport.create({
      reportDate: d2,
      completionPercentage: 8,
      workDone: 'Completed perimeter fencing and mobilized excavator machinery.',
      remarks: 'Access roads cleared successfully.',
      flaggedDelay: false,
      siteId: site3.id,
      reporterId: engineer.id,
    });
    await ProgressReport.create({
      reportDate: d3,
      completionPercentage: 12,
      workDone: 'Excavation of trench lines for structural footings. Removed 200 Cum of earth.',
      remarks: 'Groundwater table hit, water pumping rigs active.',
      flaggedDelay: false,
      siteId: site3.id,
      reporterId: engineer.id,
    });

    console.log('Seeding Labor Attendance...');
    await LabourAttendance.bulkCreate([
      // Site 1
      { date: d1, trade: 'Masons', headcount: 8, hoursWorked: 64, siteId: site1.id },
      { date: d1, trade: 'Helpers', headcount: 12, hoursWorked: 96, siteId: site1.id },
      { date: d2, trade: 'Masons', headcount: 10, hoursWorked: 80, siteId: site1.id },
      { date: d2, trade: 'Helpers', headcount: 14, hoursWorked: 112, siteId: site1.id },
      { date: d3, trade: 'Masons', headcount: 12, hoursWorked: 96, siteId: site1.id },
      { date: d3, trade: 'Helpers', headcount: 18, hoursWorked: 144, siteId: site1.id },
      { date: d3, trade: 'Welders', headcount: 4, hoursWorked: 32, siteId: site1.id },
      
      // Site 2 (Low workforce hours)
      { date: d1, trade: 'Riggers', headcount: 3, hoursWorked: 24, siteId: site2.id },
      { date: d2, trade: 'Riggers', headcount: 3, hoursWorked: 12, siteId: site2.id }, // Weather delay
      { date: d3, trade: 'Steel Erectors', headcount: 4, hoursWorked: 28, siteId: site2.id }, // Low count
      
      // Site 3
      { date: d2, trade: 'Excavator Operators', headcount: 2, hoursWorked: 16, siteId: site3.id },
      { date: d2, trade: 'Helpers', headcount: 5, hoursWorked: 40, siteId: site3.id },
      { date: d3, trade: 'Excavator Operators', headcount: 2, hoursWorked: 16, siteId: site3.id },
      { date: d3, trade: 'Helpers', headcount: 6, hoursWorked: 48, siteId: site3.id },
    ]);

    console.log('Seeding Expenses...');
    await Expense.bulkCreate([
      // Site 1
      { date: d1, category: 'Labour', amount: 1200.00, description: 'Daily wages for casual masonry workers.', siteId: site1.id, loggedBy: manager.id },
      { date: d2, category: 'Materials', amount: 8400.00, description: 'Steel bars purchase.', siteId: site1.id, loggedBy: manager.id },
      { date: d3, category: 'Materials', amount: 4500.00, description: 'Concrete delivery 50 Cum.', siteId: site1.id, loggedBy: manager.id },

      // Site 2
      { date: d1, category: 'Equipment', amount: 3500.00, description: 'Mobilization fee for crane lease.', siteId: site2.id, loggedBy: manager.id },
      { date: d3, category: 'Labour', amount: 600.00, description: 'Rigger team labor payment.', siteId: site2.id, loggedBy: manager.id },

      // Site 3
      { date: d2, category: 'Equipment', amount: 1800.00, description: 'Excavator machine hire charge.', siteId: site3.id, loggedBy: manager.id },
      { date: d3, category: 'Transport', amount: 450.00, description: 'Disposal of excavated soil.', siteId: site3.id, loggedBy: manager.id },
    ]);

    console.log('Seeding Notifications...');
    await Notification.bulkCreate([
      { title: 'Project Delay Flagged', message: 'Tower A Framing progress is delayed due to crane mobilization issues and labor shortages.', type: 'delay', read: false, userId: admin.id },
      { title: 'Project Delay Flagged', message: 'Tower A Framing progress is delayed due to crane mobilization issues and labor shortages.', type: 'delay', read: false, userId: manager.id },
      { title: 'New Site Assigned', message: 'You have been assigned as lead engineer for "Downtown Complex - Foundation Works". Please log daily progress.', type: 'info', read: false, userId: engineer.id },
      { title: 'Material Stock Critical', message: 'Cement levels at Tower A Framing are low (10 Bags remaining). Initiate procurement.', type: 'warning', read: false, userId: manager.id },
    ]);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await sequelize.close();
  }
};

// If run directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
