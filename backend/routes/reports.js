const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  ProgressReport, 
  SitePhoto, 
  Site, 
  Material, 
  LabourAttendance, 
  sequelize 
} = require('../models');
const { authMiddleware } = require('../middleware/auth');
const { notifyManagement, sendNotification } = require('../services/notificationService');

// Setup Multer for upload
const uploadDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// @route POST /api/reports/daily
// @desc Submit daily progress report (Engineer only or Admin/Manager)
router.post('/daily', authMiddleware, upload.array('photos', 5), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { 
      siteId, 
      reportDate, 
      completionPercentage, 
      workDone, 
      remarks, 
      flaggedDelay,
      materials, // stringified JSON array: [{ name, unit, received, used }]
      labour, // stringified JSON array: [{ trade, headcount, hoursWorked }]
    } = req.body;

    // Validate site ownership
    const site = await Site.findByPk(siteId);
    if (!site) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Site not found.' });
    }

    if (req.user.role === 'engineer' && site.engineerId !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ message: 'Access denied. You are not assigned to this site.' });
    }

    // 1. Create Progress Report
    const report = await ProgressReport.create({
      siteId,
      reporterId: req.user.id,
      reportDate,
      completionPercentage: parseInt(completionPercentage),
      workDone,
      remarks,
      flaggedDelay: flaggedDelay === 'true' || flaggedDelay === true,
    }, { transaction });

    // 2. Handle Photo Uploads
    const photoRecords = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // We'll store relative URL path: uploads/filename
        const photoUrl = `uploads/${file.filename}`;
        const photo = await SitePhoto.create({
          photoUrl,
          progressReportId: report.id,
        }, { transaction });
        photoRecords.push(photo);
      }
    }

    // 3. Update Material Consumption & Balance
    if (materials) {
      const parsedMaterials = typeof materials === 'string' ? JSON.parse(materials) : materials;
      for (const item of parsedMaterials) {
        const { name, unit, received = 0, used = 0 } = item;
        if (!name) continue;

        let matRecord = await Material.findOne({ 
          where: { siteId, name },
          transaction 
        });

        if (matRecord) {
          const updatedReceived = parseFloat(matRecord.received) + parseFloat(received);
          const updatedUsed = parseFloat(matRecord.used) + parseFloat(used);
          const updatedBalance = updatedReceived - updatedUsed;

          await matRecord.update({
            received: updatedReceived,
            used: updatedUsed,
            balance: updatedBalance,
          }, { transaction });
          
          // Check for critical stock depletion (< 15% balance)
          if (updatedReceived > 0 && (updatedBalance / updatedReceived) < 0.15) {
            // Non-blocking background notification (outside transaction is safer, but inside is fine if handle error)
            await notifyManagement({
              title: `Material Depleted: ${site.name}`,
              message: `Critical stock alert! "${name}" balance is low: ${updatedBalance} ${unit} remaining.`,
              type: 'warning',
            });
          }
        } else {
          const rec = parseFloat(received);
          const usd = parseFloat(used);
          await Material.create({
            name,
            unit: unit || 'Units',
            received: rec,
            used: usd,
            balance: rec - usd,
            siteId,
          }, { transaction });
        }
      }
    }

    // 4. Log Labour Attendance
    if (labour) {
      const parsedLabour = typeof labour === 'string' ? JSON.parse(labour) : labour;
      for (const item of parsedLabour) {
        const { trade, headcount = 0, hoursWorked = 0 } = item;
        if (!trade) continue;

        await LabourAttendance.create({
          date: reportDate,
          trade,
          headcount: parseInt(headcount),
          hoursWorked: parseFloat(hoursWorked),
          siteId,
        }, { transaction });
      }
    }

    // 5. If delay flagged, update site status and send immediate alert
    if (report.flaggedDelay) {
      await site.update({ status: 'delayed' }, { transaction });
      
      await notifyManagement({
        title: `Site Delay Flagged: ${site.name}`,
        message: `Engineer ${req.user.name} flagged an active delay on site: "${remarks || 'No remarks provided.'}"`,
        type: 'delay',
      });
    } else if (site.status === 'delayed') {
      // Clear delay if engineer submits clean report
      await site.update({ status: 'active' }, { transaction });
    }

    await transaction.commit();
    
    // Return report with photos
    const detailedReport = await ProgressReport.findByPk(report.id, {
      include: [{ model: SitePhoto, as: 'photos' }],
    });

    res.status(201).json(detailedReport);
  } catch (error) {
    await transaction.rollback();
    console.error('Submit report error:', error);
    res.status(500).json({ message: 'Server error submitting progress report.' });
  }
});

// @route GET /api/reports/site/:siteId
// @desc Get historical reports for a specific site
router.get('/site/:siteId', authMiddleware, async (req, res) => {
  try {
    const site = await Site.findByPk(req.params.siteId);
    if (!site) {
      return res.status(404).json({ message: 'Site not found.' });
    }

    if (req.user.role === 'engineer' && site.engineerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const reports = await ProgressReport.findAll({
      where: { siteId: req.params.siteId },
      include: [{ model: SitePhoto, as: 'photos' }],
      order: [['reportDate', 'DESC']],
    });

    res.json(reports);
  } catch (error) {
    console.error('Fetch reports error:', error);
    res.status(500).json({ message: 'Server error fetching reports.' });
  }
});

module.exports = router;
