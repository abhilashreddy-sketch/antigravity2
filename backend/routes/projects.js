const express = require('express');
const router = express.Router();
const { Project, Site } = require('../models');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// @route GET /api/projects
// @desc Get all projects
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [{ model: Site, as: 'sites', attributes: ['id', 'name', 'status'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(projects);
  } catch (error) {
    console.error('Fetch projects error:', error);
    res.status(500).json({ message: 'Server error fetching projects.' });
  }
});

// @route GET /api/projects/:id
// @desc Get single project details by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [{ model: Site, as: 'sites' }],
    });
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    res.json(project);
  } catch (error) {
    console.error('Fetch project detail error:', error);
    res.status(500).json({ message: 'Server error fetching project details.' });
  }
});

// @route POST /api/projects
// @desc Create a new project (Admin & Manager only)
router.post('/', authMiddleware, authorizeRoles('admin', 'manager'), async (req, res) => {
  const { name, description, budget, startDate, endDate, status } = req.body;
  try {
    const project = await Project.create({
      name,
      description,
      budget,
      startDate,
      endDate,
      status: status || 'planning',
    });
    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error creating project.' });
  }
});

// @route PUT /api/projects/:id
// @desc Update a project (Admin & Manager only)
router.put('/:id', authMiddleware, authorizeRoles('admin', 'manager'), async (req, res) => {
  const { name, description, budget, startDate, endDate, status } = req.body;
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    await project.update({
      name,
      description,
      budget,
      startDate,
      endDate,
      status,
    });

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error updating project.' });
  }
});

// @route DELETE /api/projects/:id
// @desc Delete a project (Admin only)
router.delete('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    await project.destroy();
    res.json({ message: 'Project deleted successfully.' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error deleting project.' });
  }
});

module.exports = router;
