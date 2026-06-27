const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { Site, Project, User, Material, ProgressReport, LabourAttendance, Expense } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const { analyzeSiteProgress } = require('../services/aiService');

// @route GET /api/exports/pdf/:siteId
// @desc Generate PDF progress report for a construction site
router.get('/pdf/:siteId', authMiddleware, async (req, res) => {
  try {
    const site = await Site.findByPk(req.params.siteId, {
      include: [
        { model: Project, as: 'project' },
        { model: User, as: 'engineer', attributes: ['name', 'email'] },
        { model: Material, as: 'materials' },
        { model: ProgressReport, as: 'progressReports', include: [{ model: User, as: 'reporter', attributes: ['name'] }] },
        { model: LabourAttendance, as: 'labourRecords' },
        { model: Expense, as: 'expenses' },
      ],
      order: [
        [{ model: ProgressReport, as: 'progressReports' }, 'reportDate', 'DESC']
      ]
    });

    if (!site) {
      return res.status(404).json({ message: 'Site not found.' });
    }

    if (req.user.role === 'engineer' && site.engineerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Run AI fallback/live analysis to embed in PDF
    const aiAnalysis = await analyzeSiteProgress(site);

    // Create a PDF Document
    const doc = new PDFDocument({ margin: 50 });

    // Stream PDF response directly
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ProgressReport_Site_${site.id}.pdf`);
    doc.pipe(res);

    // Header styling
    doc.fillColor('#1e3a8a').fontSize(24).text('SITE PROGRESS LOGISTICS REPORT', { align: 'center' });
    doc.fontSize(10).fillColor('#4b5563').text(`Generated on: ${new Date().toLocaleDateString()} | Site Tracking Dashboard`, { align: 'center' });
    doc.moveDown();
    
    // Horizontal rule
    doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // 1. Site Metadata
    doc.fillColor('#1e3a8a').fontSize(14).text('1. SITE METADATA', { underline: true });
    doc.moveDown(0.5);
    doc.fillColor('#000000').fontSize(11);
    doc.text(`Site Name: ${site.name}`);
    doc.text(`Project Name: ${site.project?.name || 'N/A'}`);
    doc.text(`Location: ${site.location}`);
    doc.text(`Lead Engineer: ${site.engineer?.name || 'Not Assigned'} (${site.engineer?.email || 'N/A'})`);
    doc.text(`Current Operational Status: ${site.status.toUpperCase()}`);
    
    const latestPercentage = site.progressReports && site.progressReports.length > 0
      ? site.progressReports[0].completionPercentage
      : 0;
    doc.text(`Overall Progress: ${latestPercentage}% Complete`);
    doc.moveDown();

    // 2. AI Analysis & Recommendations
    doc.fillColor('#1e3a8a').fontSize(14).text('2. OPERATIONAL RISK ANALYSIS (AI ENGINE)', { underline: true });
    doc.moveDown(0.5);
    doc.fillColor('#000000').fontSize(10);
    doc.text(`Risk Assessment Level: ${aiAnalysis.delayRisk || 'Low'}`, { stroke: true });
    doc.moveDown(0.2);
    doc.text(`Summary: ${aiAnalysis.summary}`);
    doc.moveDown(0.2);
    doc.text(`Timeline Status: ${aiAnalysis.timelineAnalysis}`);
    doc.moveDown(0.2);
    doc.text(`Inventory Status: ${aiAnalysis.materialUtilization}`);
    doc.moveDown(0.5);
    
    doc.fillColor('#1e3a8a').fontSize(11).text('Key Management Actions Recommended:');
    doc.fillColor('#000000').fontSize(10);
    if (aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0) {
      aiAnalysis.recommendations.forEach((rec, idx) => {
        doc.text(`  • ${rec}`);
      });
    } else {
      doc.text('  • No immediate actions required. Continue logging daily audits.');
    }
    doc.moveDown();

    // 3. Materials Inventory Status
    doc.fillColor('#1e3a8a').fontSize(14).text('3. MATERIAL STOCKS BALANCE', { underline: true });
    doc.moveDown(0.5);
    
    // Draw simple table headers
    let startY = doc.y;
    doc.fillColor('#1e3a8a').fontSize(10);
    doc.text('Material Name', 50, startY);
    doc.text('Unit', 200, startY);
    doc.text('Total Received', 270, startY);
    doc.text('Total Used', 370, startY);
    doc.text('Current Stock', 470, startY);
    
    doc.strokeColor('#d1d5db').lineWidth(1).moveTo(50, startY + 15).lineTo(550, startY + 15).stroke();
    doc.fillColor('#000000');

    let currentY = startY + 22;
    if (site.materials && site.materials.length > 0) {
      site.materials.forEach(mat => {
        doc.text(mat.name, 50, currentY);
        doc.text(mat.unit, 200, currentY);
        doc.text(parseFloat(mat.received).toFixed(1), 270, currentY);
        doc.text(parseFloat(mat.used).toFixed(1), 370, currentY);
        doc.text(parseFloat(mat.balance).toFixed(1), 470, currentY);
        currentY += 15;
      });
    } else {
      doc.text('No materials logged.', 50, currentY);
      currentY += 15;
    }
    doc.y = currentY;
    doc.moveDown();

    // 4. Financial Expense Breakdown
    doc.fillColor('#1e3a8a').fontSize(14).text('4. FINANCIAL EXPENDITURES SUMMARY', { underline: true });
    doc.moveDown(0.5);

    startY = doc.y;
    doc.fillColor('#1e3a8a').fontSize(10);
    doc.text('Log Date', 50, startY);
    doc.text('Category', 150, startY);
    doc.text('Amount', 280, startY);
    doc.text('Description', 380, startY);

    doc.strokeColor('#d1d5db').lineWidth(1).moveTo(50, startY + 15).lineTo(550, startY + 15).stroke();
    doc.fillColor('#000000');

    currentY = startY + 22;
    let totalSpent = 0;
    if (site.expenses && site.expenses.length > 0) {
      site.expenses.forEach(exp => {
        doc.text(exp.date, 50, currentY);
        doc.text(exp.category, 150, currentY);
        doc.text(`$${parseFloat(exp.amount).toFixed(2)}`, 280, currentY);
        
        const desc = exp.description ? (exp.description.length > 30 ? exp.description.substring(0, 27) + '...' : exp.description) : 'N/A';
        doc.text(desc, 380, currentY);
        
        totalSpent += parseFloat(exp.amount);
        currentY += 15;
      });
      
      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, currentY).lineTo(550, currentY).stroke();
      currentY += 5;
      doc.fillColor('#1e3a8a').text(`TOTAL DIRECT COSTS LOGGED: $${totalSpent.toFixed(2)}`, 50, currentY, { stroke: true });
      currentY += 15;
    } else {
      doc.text('No expenses logged for this site.', 50, currentY);
      currentY += 15;
    }

    doc.y = currentY;
    doc.moveDown();

    // Footer note
    doc.fontSize(8).fillColor('#9ca3af').text('End of report. All information is sourced directly from site engineer logs and subject to audit.', { align: 'center' });

    // Finalize PDF file
    doc.end();
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ message: 'Server error generating PDF report.' });
  }
});

// @route GET /api/exports/csv/:siteId
// @desc Generate CSV progress logs for a construction site
router.get('/csv/:siteId', authMiddleware, async (req, res) => {
  try {
    const site = await Site.findByPk(req.params.siteId, {
      include: [
        { model: ProgressReport, as: 'progressReports' },
      ],
      order: [
        [{ model: ProgressReport, as: 'progressReports' }, 'reportDate', 'DESC']
      ]
    });

    if (!site) {
      return res.status(404).json({ message: 'Site not found.' });
    }

    if (req.user.role === 'engineer' && site.engineerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Set CSV download headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=ProgressLog_Site_${site.id}.csv`);

    // Compile rows
    let csvContent = 'Report Date,Completion %,Work Done,Remarks,Delay Flagged\n';
    
    if (site.progressReports && site.progressReports.length > 0) {
      site.progressReports.forEach(rep => {
        // Escape commas and double quotes for clean CSV layout
        const date = rep.reportDate;
        const comp = rep.completionPercentage;
        const work = `"${(rep.workDone || '').replace(/"/g, '""')}"`;
        const rem = `"${(rep.remarks || '').replace(/"/g, '""')}"`;
        const delay = rep.flaggedDelay ? 'YES' : 'NO';
        
        csvContent += `${date},${comp},${work},${rem},${delay}\n`;
      });
    }

    res.send(csvContent);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ message: 'Server error generating CSV report.' });
  }
});

module.exports = router;
