require('dotenv').config();

// Try to import Google Gen AI SDK, fallback to rule-based analysis if it fails or API key is missing
let GoogleGenAI = null;
try {
  const sdk = require('@google/genai');
  GoogleGenAI = sdk.GoogleGenAI;
} catch (e) {
  console.log('[AI Service] @google/genai package not installed or failed to load. Using fallback rule-based engine.');
}

/**
 * Generate AI analysis report for a site
 * @param {Object} data - Contains site data, progress reports, materials, labour records, expenses
 */
const analyzeSiteProgress = async (siteData) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (apiKey && GoogleGenAI) {
    try {
      console.log(`[AI Service] Running Gemini AI Analysis for Site: ${siteData.name}...`);
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
You are an expert construction project controller and analyst. Analyze the following site progress data and provide a detailed analysis.
Return your response as a valid JSON object only. Do NOT include markdown code blocks, backticks, or any conversational text around it.

Site Data:
- Name: ${siteData.name}
- Status: ${siteData.status}
- Project: ${siteData.project?.name || 'N/A'} (Budget: $${siteData.project?.budget || 0}, Duration: ${siteData.project?.startDate} to ${siteData.project?.endDate})
- Current Progress reports: ${JSON.stringify(siteData.progressReports || [])}
- Materials inventory: ${JSON.stringify(siteData.materials || [])}
- Labour attendance logs: ${JSON.stringify(siteData.labourRecords || [])}
- Expenses: ${JSON.stringify(siteData.expenses || [])}

Required JSON Output Structure:
{
  "summary": "High-level summary of current status.",
  "delayRisk": "High" | "Medium" | "Low",
  "timelineAnalysis": "Explanation of timeline status, delays, and slippage.",
  "materialUtilization": "Insights on material inventory levels, stockout risks, etc.",
  "labourProductivity": "Evaluation of workforce attendance and productivity.",
  "expenseAnalysis": "Evaluation of expenses against budget and efficiency.",
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2",
    "Actionable recommendation 3"
  ]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || '';
      // Clean potential JSON markdown blocks if Gemini wraps it
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('[AI Service] Gemini API failed, using rule-based fallback:', error.message);
      return runRuleBasedAnalysis(siteData);
    }
  } else {
    console.log('[AI Service] GEMINI_API_KEY not found or SDK not loaded. Running rule-based analytical engine.');
    return runRuleBasedAnalysis(siteData);
  }
};

/**
 * Fallback Rule-Based Analytical Engine
 */
const runRuleBasedAnalysis = (siteData) => {
  const reports = siteData.progressReports || [];
  const materials = siteData.materials || [];
  const labour = siteData.labourRecords || [];
  const expenses = siteData.expenses || [];
  const project = siteData.project || {};

  // 1. Get latest report and check progress
  const latestReport = reports.length > 0 ? reports[reports.length - 1] : null;
  const currentProgress = latestReport ? latestReport.completionPercentage : 0;
  
  // 2. Timeline Analysis
  let timelineAnalysis = "Insufficient progress reports to assess timeline.";
  let delayRisk = "Low";
  let timelineIssuesCount = 0;

  if (project.startDate && project.endDate) {
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const today = new Date();
    
    const totalDuration = end - start;
    const elapsed = today - start;
    
    if (totalDuration > 0) {
      const timeElapsedRatio = Math.min(1, Math.max(0, elapsed / totalDuration));
      const expectedProgress = Math.round(timeElapsedRatio * 100);
      
      const slippage = expectedProgress - currentProgress;
      
      if (slippage > 15) {
        delayRisk = "High";
        timelineAnalysis = `Significant delay detected. Based on project dates, current elapsed time represents ${expectedProgress}% of project duration, but progress is only at ${currentProgress}%. The site is slipping by ${slippage}% behind schedule.`;
        timelineIssuesCount += 2;
      } else if (slippage > 5) {
        delayRisk = "Medium";
        timelineAnalysis = `Minor timeline slippage. Expected progress at this point is roughly ${expectedProgress}%, and current progress is ${currentProgress}%. The site is slipping by ${slippage}% behind schedule.`;
        timelineIssuesCount += 1;
      } else {
        timelineAnalysis = `Timeline on track. Expected progress based on elapsed time is ${expectedProgress}%, and current progress is ${currentProgress}%.`;
      }
    }
  } else if (latestReport && latestReport.flaggedDelay) {
    delayRisk = "High";
    timelineAnalysis = "Engineer flagged an active delay on site: " + (latestReport.remarks || "No comments provided.");
  }

  // 3. Material Utilization Analysis
  let materialUtilization = "No active material records tracking stock levels.";
  const materialAlerts = [];
  
  if (materials.length > 0) {
    materialUtilization = "Material inventory levels are being monitored. ";
    materials.forEach(mat => {
      const balance = parseFloat(mat.balance) || 0;
      const received = parseFloat(mat.received) || 0;
      
      if (received > 0) {
        const stockRatio = balance / received;
        if (stockRatio < 0.15) {
          materialAlerts.push(`Critical depletion of ${mat.name}: Only ${balance} ${mat.unit} remaining (less than 15% of stock received).`);
        } else if (stockRatio < 0.3) {
          materialAlerts.push(`Low stock alert for ${mat.name}: ${balance} ${mat.unit} remaining.`);
        }
      }
    });
    
    if (materialAlerts.length > 0) {
      materialUtilization += materialAlerts.join(' ');
      if (delayRisk === "Low") delayRisk = "Medium";
    } else {
      materialUtilization += "All tracked materials have sufficient stock levels for current tasks.";
    }
  }

  // 4. Labour Productivity Analysis
  let labourProductivity = "No labour logs available for analysis.";
  let totalWorkers = 0;
  let totalHours = 0;
  
  if (labour.length > 0) {
    labour.forEach(entry => {
      totalWorkers += parseInt(entry.headcount) || 0;
      totalHours += parseFloat(entry.hoursWorked) || 0;
    });
    
    const avgHoursPerWorker = totalWorkers > 0 ? (totalHours / totalWorkers).toFixed(1) : 0;
    labourProductivity = `Monitored labor workforce comprises multiple trades. Average logged work hours per worker is ${avgHoursPerWorker} hrs. `;
    
    if (avgHoursPerWorker < 6 && totalWorkers > 0) {
      labourProductivity += "Warning: Under-utilization of workforce hours detected.";
      timelineIssuesCount += 1;
    } else if (avgHoursPerWorker > 10 && totalWorkers > 0) {
      labourProductivity += "High overtime logged, watch for fatigue risks.";
    } else {
      labourProductivity += "Labor allocation and shift hours are within normal operating bounds.";
    }
  }

  // 5. Expense Analysis
  let expenseAnalysis = "No expenses logged for this site.";
  let totalExpenses = 0;
  
  if (expenses.length > 0) {
    expenses.forEach(exp => {
      totalExpenses += parseFloat(exp.amount) || 0;
    });
    
    expenseAnalysis = `Total expenditures logged at this site sum up to $${totalExpenses.toFixed(2)}. `;
    if (project.budget) {
      const budget = parseFloat(project.budget);
      const budgetConsumption = (totalExpenses / budget) * 100;
      
      if (budgetConsumption > 90 && currentProgress < 85) {
        expenseAnalysis += `Alert: Budget consumption is high (${budgetConsumption.toFixed(1)}%) compared to site completion (${currentProgress}%). High risk of budget overrun.`;
        delayRisk = "High";
      } else {
        expenseAnalysis += `Budget consumption is at ${budgetConsumption.toFixed(1)}% of total project budget ($${budget.toFixed(2)}).`;
      }
    }
  }

  // Determine Overall Summary
  let summary = `Site "${siteData.name}" is currently ${siteData.status}. Completion is recorded at ${currentProgress}%. `;
  if (delayRisk === "High") {
    summary += "Urgent management attention is required due to critical timeline or budget risks.";
  } else if (delayRisk === "Medium") {
    summary += "Minor issues detected in material stocks or minor scheduling slips. Performance is stable but requires oversight.";
  } else {
    summary += "Overall operational efficiency is high with normal inventory and scheduling indicators.";
  }

  // Formulate Actionable Recommendations
  const recommendations = [];
  if (timelineIssuesCount > 1) {
    recommendations.push("Review schedule baseline and consider allocating extra workforce to accelerate delayed activities.");
  }
  if (materialAlerts.length > 0) {
    recommendations.push("Initiate procurements immediately for low-stock items (Cement, Steel, or other consumables).");
  }
  if (totalExpenses > (parseFloat(project.budget) || 0) * 0.8 && currentProgress < 75) {
    recommendations.push("Conduct a cost audit on major expenditure items to identify and mitigate leakage areas.");
  }
  if (labour.length === 0) {
    recommendations.push("Ensure site engineers log daily attendance for all sub-contractors to maintain resource tracking.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Maintain standard operational cycles and continue logging daily reports.");
    recommendations.push("Conduct routine quality compliance walks.");
  }

  return {
    summary,
    delayRisk,
    timelineAnalysis,
    materialUtilization,
    labourProductivity,
    expenseAnalysis,
    recommendations,
  };
};

module.exports = {
  analyzeSiteProgress,
};
