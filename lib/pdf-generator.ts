import jsPDF from 'jspdf';
import { AnalysisResult } from './types';

export async function generatePDF(result: AnalysisResult): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 20;

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    
    // Check if we need a new page
    if (yPosition + (lines.length * fontSize * 0.4) > doc.internal.pageSize.height - margin) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.text(lines, margin, yPosition);
    yPosition += lines.length * fontSize * 0.4 + 5;
  };

  // Header with gradient effect (simulated with multiple rectangles)
  doc.setFillColor(59, 130, 246); // Blue
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('LinkedIn Profile Analysis Report', margin, 25);
  
  doc.setTextColor(0, 0, 0);
  yPosition = 60;

  // Overall Score
  addText(`Overall Profile Score: ${result.overallScore}/100`, 18, true);
  yPosition += 10;

  // Section Scores
  addText('Section Scores:', 16, true);
  Object.entries(result.sectionScores).forEach(([section, score]) => {
    addText(`${section.charAt(0).toUpperCase() + section.slice(1)}: ${score}/100`, 12);
  });
  yPosition += 10;

  // Key Insights
  addText('Key Insights:', 16, true);
  result.insights.forEach((insight, index) => {
    addText(`${index + 1}. ${insight}`, 12);
  });
  yPosition += 10;

  // Rewrites
  addText('AI-Generated Profile Rewrites:', 16, true);
  Object.entries(result.rewrites).forEach(([section, rewrite]) => {
    if (!rewrite) return;
    
    const displayName = section === 'experienceImprovements' ? 'Experience Improvements' :
                        section === 'skillsPresentation' ? 'Skills Presentation' :
                        section.charAt(0).toUpperCase() + section.slice(1);
    
    addText(`${displayName} Section:`, 14, true);
    
    if (section === 'experienceImprovements' && Array.isArray(rewrite)) {
      rewrite.forEach((item, index) => {
        addText(`${index + 1}. ${item.originalRole}:`, 12, true);
        addText(item.improvedDescription, 11);
        yPosition += 3;
      });
    } else if (typeof rewrite === 'string') {
      addText(rewrite, 11);
    }
    yPosition += 5;
  });

  // Skills Analysis
  addText('Skills Analysis:', 16, true);
  addText('Strong Skills:', 14, true);
  addText(result.strongSkills.join(', '), 12);
  yPosition += 5;

  addText('Skills to Develop:', 14, true);
  addText(result.missingSkills.join(', '), 12);
  yPosition += 10;

  // Career Matches
  addText('Recommended Career Paths:', 16, true);
  result.careerMatches.forEach((career, index) => {
    addText(`${index + 1}. ${career.role} (${career.matchPercentage}% match)`, 14, true);
    addText(career.description, 12);
    addText(`Key Requirements: ${career.requirements.join(', ')}`, 11);
    yPosition += 5;
  });

  // Footer
  const now = new Date();
  const footer = `Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(footer, margin, doc.internal.pageSize.height - 10);

  // Download the PDF
  doc.save('linkedin-profile-analysis.pdf');
}