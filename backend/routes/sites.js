const express = require('express');
const router = express.Router();
const { Site, Project, User, Material, ProgressReport, SitePhoto, LabourAttendance, Expense } = require('../models');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const { notifyManagement } = require('../services/notificationService');

// @route GET /api/sites
// @desc Get all sites (Engineers only get their assigned sites, Admin/Managers get all)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let whereClause = {};
    if (req.user.role === 'engineer') {
      whereClause.engineerId = req.user.id;
    }

    const sites = await Site.findAll({
      where: whereClause,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'engineer', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(sites);
  } catch (error) {
    console.error('Fetch sites error:', error);
    res.status(500).json({ message: 'Server error fetching sites.' });
  }
});

// @route GET /api/sites/:id
// @desc Get site details with logs (Reports, Materials, Labour, Expenses)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const site = await Site.findByPk(req.params.id, {
      include: [
        { model: Project, as: 'project' },
        { model: User, as: 'engineer', attributes: ['id', 'name', 'email', 'phone'] },
        { 
          model: ProgressReport, 
          as: 'progressReports', 
          include: [{ model: SitePhoto, as: 'photos' }],
        },
        { model: Material, as: 'materials' },
        { model: LabourAttendance, as: 'labourRecords' },
        { model: Expense, as: 'expenses', include: [{ model: User, as: 'logger', attributes: ['name'] }] },
      ],
      order: [
        [{ model: ProgressReport, as: 'progressReports' }, 'reportDate', 'DESC'],
        [{ model: LabourAttendance, as: 'labourRecords' }, 'date', 'DESC'],
        [{ model: Expense, as: 'expenses' }, 'date', 'DESC'],
      ],
    });

    if (!site) {
      return res.status(404).json({ message: 'Site not found.' });
    }

    // Role check: Engineers can only access their assigned sites
    if (req.user.role === 'engineer' && site.engineerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You are not assigned to this site.' });
    }

    res.json(site);
  } catch (error) {
    console.error('Fetch site detail error:', error);
    res.status(500).json({ message: 'Server error fetching site details.' });
  }
});

// @route POST /api/sites
// @desc Create a new site (Admin & Manager only)
router.post('/', authMiddleware, authorizeRoles('admin', 'manager'), async (req, res) => {
  const { name, location, latitude, longitude, status, projectId, engineerId } = req.body;
  try {
    // Verify project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(400).json({ message: 'Invalid Project ID.' });
    }

    // Verify engineer exists and is indeed an engineer (or manager/admin)
    if (engineerId) {
      const engineer = await User.findByPk(engineerId);
      if (!engineer) {
        return res.status(400).json({ message: 'Invalid Engineer ID.' });
      }
    }

    const site = await Site.create({
      name,
      location,
      latitude,
      longitude,
      status: status || 'active',
      projectId,
      engineerId,
    });

    // Notify engineer if assigned
    if (engineerId) {
      const { sendNotification } = require('../services/notificationService');
      await sendNotification({
        userId: engineerId,
        title: 'New Site Assignment',
        message: `You have been assigned as the site engineer for "${name}".`,
        type: 'info',
        sendEmail: true,
      });
    }

    res.status(201).json(site);
  } catch (error) {
    console.error('Create site error:', error);
    res.status(500).json({ message: 'Server error creating site.' });
  }
});

// @route PUT /api/sites/:id
// @desc Update a site (Admin & Manager only)
router.put('/:id', authMiddleware, authorizeRoles('admin', 'manager'), async (req, res) => {
  const { name, location, latitude, longitude, status, projectId, engineerId } = req.body;
  try {
    const site = await Site.findByPk(req.params.id);
    if (!site) {
      return res.status(404).json({ message: 'Site not found.' });
    }

    const oldEngineerId = site.engineerId;

    await site.update({
      name,
      location,
      latitude,
      longitude,
      status,
      projectId,
      engineerId,
    });

    // If engineer changed, notify new engineer
    if (engineerId && engineerId !== oldEngineerId) {
      const { sendNotification } = require('../services/notificationService');
      await sendNotification({
        userId: engineerId,
        title: 'Site Assignment Change',
        message: `You have been assigned as the site engineer for "${site.name}".`,
        type: 'info',
        sendEmail: true,
      });
    }

    res.json(site);
  } catch (error) {
    console.error('Update site error:', error);
    res.status(500).json({ message: 'Server error updating site.' });
  }
});

// @route DELETE /api/sites/:id
// @desc Delete a site (Admin only)
router.delete('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const site = await Site.findByPk(req.params.id);
    if (!site) {
      return res.status(404).json({ message: 'Site not found.' });
    }
    await site.destroy();
    res.json({ message: 'Site deleted successfully.' });
  } catch (error) {
    console.error('Delete site error:', error);
    res.status(500).json({ message: 'Server error deleting site.' });
  }
});

// @route POST /api/sites/:id/expenses
// @desc Log an expense for a site (Admin & Manager & assigned Engineer)
router.post('/:id/expenses', authMiddleware, async (req, res) => {
  const { date, category, amount, description } = req.body;
  try {
    const site = await Site.findByPk(req.params.id);
    if (!site) {
      return res.status(404).json({ message: 'Site not found.' });
    }

    // Role check: Engineer must be assigned to site to log expenses
    if (req.user.role === 'engineer' && site.engineerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You are not assigned to this site.' });
    }

    const expense = await Expense.create({
      date,
      category,
      amount,
      description,
      siteId: site.id,
      loggedBy: req.user.id,
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Log expense error:', error);
    res.status(500).json({ message: 'Server error logging expense.' });
  }
});

// @route POST /api/sites/:id/materials/inventory
// @desc Setup or update stock balance directly (Admin & Manager)
router.post('/:id/materials/inventory', authMiddleware, authorizeRoles('admin', 'manager'), async (req, res) => {
  const { name, unit, received, used } = req.body;
  try {
    const site = await Site.findByPk(req.params.id);
    if (!site) {
      return res.status(404).json({ message: 'Site not found.' });
    }

    let material = await Material.findOne({ where: { siteId: site.id, name } });
    if (material) {
      const newReceived = parseFloat(material.received) + parseFloat(received || 0);
      const newUsed = parseFloat(material.used) + parseFloat(used || 0);
      const newBalance = newReceived - newUsed;
      
      await material.update({
        received: newReceived,
        used: newUsed,
        balance: newBalance,
      });
    } else {
      const rec = parseFloat(received || 0);
      const usd = parseFloat(used || 0);
      material = await Material.create({
        name,
        unit,
        received: rec,
        used: usd,
        balance: rec - usd,
        siteId: site.id,
      });
    }

    res.json(material);
  } catch (error) {
    console.error('Update material stock error:', error);
    res.status(500).json({ message: 'Server error updating material inventory.' });
  }
});

module.exports = router;
