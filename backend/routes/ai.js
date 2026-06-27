const express = require('express');
const router = express.Router();
const { Site, Project, Material, ProgressReport, LabourAttendance, Expense, User } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const { analyzeSiteProgress } = require('../services/aiService');

// @route POST /api/ai/analyze/:siteId
// @desc Trigger AI Analysis for a site's progress logs
router.post('/analyze/:siteId', authMiddleware, async (req, res) => {
  try {
    const site = await Site.findByPk(req.params.siteId, {
      include: [
        { model: Project, as: 'project' },
        { model: Material, as: 'materials' },
        { model: ProgressReport, as: 'progressReports', limit: 10, order: [['reportDate', 'DESC']] },
        { model: LabourAttendance, as: 'labourRecords', limit: 20, order: [['date', 'DESC']] },
        { model: Expense, as: 'expenses' },
      ],
    });

    if (!site) {
      return res.status(404).json({ message: 'Site not found.' });
    }

    // Role verification: Engineers can only trigger analysis for their own sites
    if (req.user.role === 'engineer' && site.engineerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You are not assigned to this site.' });
    }

    const analysis = await analyzeSiteProgress(site);
    res.json(analysis);
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ message: 'Server error triggering AI analysis.' });
  }
});

module.exports = router;
