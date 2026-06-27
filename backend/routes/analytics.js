const express = require('express');
const router = express.Router();
const { Site, Project, Material, ProgressReport, LabourAttendance, Expense, sequelize } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');

// @route GET /api/analytics/kpis
// @desc Get overall KPIs (Admin & Manager view, or scoped if needed)
router.get('/kpis', authMiddleware, async (req, res) => {
  try {
    let siteFilter = {};
    if (req.user.role === 'engineer') {
      siteFilter.engineerId = req.user.id;
    }

    // 1. Total sites count & breakups
    const totalSites = await Site.count({ where: siteFilter });
    const activeSites = await Site.count({ where: { ...siteFilter, status: 'active' } });
    const delayedSites = await Site.count({ where: { ...siteFilter, status: 'delayed' } });
    const completedSites = await Site.count({ where: { ...siteFilter, status: 'completed' } });

    // 2. Budget and expenses
    // Project budgets (only sum budgets of projects linked to sites of this engineer if role is engineer)
    let projectBudgets = 0;
    if (req.user.role === 'engineer') {
      const projects = await Project.findAll({
        include: [{ model: Site, as: 'sites', where: { engineerId: req.user.id }, required: true }]
      });
      projectBudgets = projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0);
    } else {
      const projects = await Project.findAll();
      projectBudgets = projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0);
    }

    // Expense totals
    const expenses = await Expense.findAll({
      include: [{ model: Site, as: 'site', where: siteFilter, required: true }]
    });
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    // 3. Average completion progress
    // Get latest report completion rate for each site
    const sites = await Site.findAll({
      where: siteFilter,
      include: [{ 
        model: ProgressReport, 
        as: 'progressReports', 
        limit: 1, 
        order: [['reportDate', 'DESC']] 
      }]
    });

    let totalProgressSum = 0;
    let countedReports = 0;
    sites.forEach(s => {
      if (s.progressReports && s.progressReports.length > 0) {
        totalProgressSum += s.progressReports[0].completionPercentage;
        countedReports++;
      }
    });
    const avgProgress = countedReports > 0 ? Math.round(totalProgressSum / countedReports) : 0;

    res.json({
      totalSites,
      activeSites,
      delayedSites,
      completedSites,
      totalBudget: projectBudgets,
      totalExpenses,
      avgProgress,
    });
  } catch (error) {
    console.error('Fetch KPIs error:', error);
    res.status(500).json({ message: 'Server error compiling KPI analytics.' });
  }
});

// @route GET /api/analytics/charts
// @desc Get analytics charts datasets (Line chart progress, material stock, labor trades, category expenses)
router.get('/charts', authMiddleware, async (req, res) => {
  try {
    let siteFilter = {};
    if (req.user.role === 'engineer') {
      siteFilter.engineerId = req.user.id;
    }

    // 1. Material Stocks (Bar Chart)
    const materials = await Material.findAll({
      include: [{ model: Site, as: 'site', where: siteFilter, required: true }],
      limit: 15,
    });
    const materialData = materials.map(m => ({
      name: `${m.name} (${m.site.name.split('-')[0].trim()})`,
      received: parseFloat(m.received),
      used: parseFloat(m.used),
      balance: parseFloat(m.balance),
      unit: m.unit,
    }));

    // 2. Labor Attendance over time (Grouped by Date)
    const laborLogs = await LabourAttendance.findAll({
      include: [{ model: Site, as: 'site', where: siteFilter, required: true }],
      order: [['date', 'ASC']],
      limit: 30,
    });
    
    // Group headcount by date
    const laborTimelineMap = {};
    laborLogs.forEach(log => {
      if (!laborTimelineMap[log.date]) {
        laborTimelineMap[log.date] = 0;
      }
      laborTimelineMap[log.date] += log.headcount;
    });
    const laborTimeline = Object.keys(laborTimelineMap).map(date => ({
      date,
      headcount: laborTimelineMap[date],
    }));

    // 3. Expenses by Category (Doughnut Chart)
    const expenses = await Expense.findAll({
      include: [{ model: Site, as: 'site', where: siteFilter, required: true }],
    });
    
    const expenseCategories = {
      Materials: 0,
      Labour: 0,
      Equipment: 0,
      Transport: 0,
      Miscellaneous: 0,
    };
    expenses.forEach(e => {
      if (expenseCategories[e.category] !== undefined) {
        expenseCategories[e.category] += parseFloat(e.amount);
      } else {
        expenseCategories.Miscellaneous += parseFloat(e.amount);
      }
    });
    const expenseData = Object.keys(expenseCategories).map(cat => ({
      category: cat,
      amount: expenseCategories[cat],
    }));

    // 4. Progress over time per site (Line Chart)
    const progressReports = await ProgressReport.findAll({
      include: [{ model: Site, as: 'site', where: siteFilter, required: true }],
      order: [['reportDate', 'ASC']],
    });

    const progressData = {};
    progressReports.forEach(rep => {
      const siteName = rep.site.name;
      if (!progressData[siteName]) {
        progressData[siteName] = [];
      }
      progressData[siteName].push({
        date: rep.reportDate,
        percentage: rep.completionPercentage,
      });
    });

    res.json({
      materials: materialData,
      laborTimeline,
      expenses: expenseData,
      progressTrend: progressData,
    });
  } catch (error) {
    console.error('Fetch charts error:', error);
    res.status(500).json({ message: 'Server error compiling chart analytics.' });
  }
});

module.exports = router;
