import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

/**
 * Format currency in Kenyan Shillings
 */
function formatCurrency(amount) {
  return `KES ${parseFloat(amount).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Generate PDF invoice for quotation
 * @param {Object} quoteData - Quotation details
 * @param {Object} clientData - Client information
 * @param {Object} projectData - Project details
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateInvoicePDF(quoteData, clientData, projectData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Invoice - ${clientData.client_name}`,
          Author: 'PlanMorph Tech',
          Subject: `Quotation for ${projectData.project_type}`
        }
      });

      const chunks = [];
      
      // Collect PDF chunks
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Colors
      const primaryColor = '#6366f1'; // Indigo
      const secondaryColor = '#8b5cf6'; // Purple
      const textColor = '#1f2937';
      const lightGray = '#f3f4f6';

      // Header with gradient effect
      doc.rect(0, 0, doc.page.width, 150).fill(primaryColor);
      
      // Company Logo/Name
      doc.fontSize(32)
         .fillColor('#ffffff')
         .font('Helvetica-Bold')
         .text('PLANMORPH', 50, 40);
      
      doc.fontSize(14)
         .fillColor('#e0e7ff')
         .font('Helvetica')
         .text('TECH CONSULTANCY', 50, 75);

      // Invoice title
      doc.fontSize(20)
         .fillColor('#ffffff')
         .font('Helvetica-Bold')
         .text('PROJECT QUOTATION', 50, 110);

      // Reset Y position after header
      let yPosition = 180;

      // Invoice details box
      doc.fontSize(10)
         .fillColor(textColor)
         .font('Helvetica');

      // Two columns layout
      const leftColumn = 50;
      const rightColumn = 320;

      // Left column - Client details
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(primaryColor)
         .text('BILL TO:', leftColumn, yPosition);

      yPosition += 20;
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor(textColor)
         .text(clientData.client_name, leftColumn, yPosition);

      yPosition += 15;
      doc.fontSize(10)
         .font('Helvetica')
         .text(clientData.company_name || '', leftColumn, yPosition);

      yPosition += 15;
      doc.text(clientData.client_email, leftColumn, yPosition);

      yPosition += 15;
      doc.text(clientData.client_phone, leftColumn, yPosition);

      // Right column - Invoice details
      yPosition = 180;
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(primaryColor)
         .text('INVOICE DETAILS:', rightColumn, yPosition);

      yPosition += 20;
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor(textColor)
         .text(`Invoice #: PM-${String(quoteData.id).padStart(5, '0')}`, rightColumn, yPosition);

      yPosition += 15;
      const invoiceDate = new Date(quoteData.sent_at).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Date: ${invoiceDate}`, rightColumn, yPosition);

      yPosition += 15;
      doc.text(`Timeline: ${quoteData.timeline_weeks} weeks`, rightColumn, yPosition);

      // Project details section
      yPosition = 320;
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor(primaryColor)
         .text('PROJECT DETAILS', leftColumn, yPosition);

      yPosition += 25;
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor(textColor)
         .text('Project Type:', leftColumn, yPosition);
      
      doc.font('Helvetica')
         .text(projectData.project_type, leftColumn + 100, yPosition);

      yPosition += 20;
      doc.font('Helvetica-Bold')
         .text('Requirements:', leftColumn, yPosition);

      yPosition += 15;
      const requirements = projectData.requirements || 'No specific requirements provided';
      const reqLines = doc.font('Helvetica')
                          .widthOfString(requirements, { width: 500 });
      doc.text(requirements, leftColumn, yPosition, {
        width: 500,
        align: 'left'
      });
      
      yPosition += Math.max(reqLines / 10, 30);

      // Cost breakdown section
      yPosition += 30;
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor(primaryColor)
         .text('COST BREAKDOWN', leftColumn, yPosition);

      yPosition += 20;

      // Table header
      doc.rect(leftColumn, yPosition, 495, 30).fill(lightGray);
      
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor(textColor)
         .text('Description', leftColumn + 10, yPosition + 10)
         .text('Amount', leftColumn + 400, yPosition + 10);

      yPosition += 30;

      // Table rows
      const costBreakdown = quoteData.cost_breakdown || {};
      const breakdownItems = [
        { label: 'Design & UI/UX', key: 'design' },
        { label: 'Development', key: 'development' },
        { label: 'Testing & QA', key: 'testing' },
        { label: 'Deployment & Setup', key: 'deployment' }
      ];

      doc.font('Helvetica');
      breakdownItems.forEach((item, index) => {
        const bgColor = index % 2 === 0 ? '#ffffff' : lightGray;
        doc.rect(leftColumn, yPosition, 495, 25).fill(bgColor);
        
        doc.fillColor(textColor)
           .text(item.label, leftColumn + 10, yPosition + 7)
           .text(formatCurrency(costBreakdown[item.key] || 0), leftColumn + 400, yPosition + 7);
        
        yPosition += 25;
      });

      // Subtotal
      yPosition += 10;
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .text('SUBTOTAL:', leftColumn + 300, yPosition)
         .text(formatCurrency(quoteData.total_cost), leftColumn + 400, yPosition);

      // Total with background
      yPosition += 25;
      doc.rect(leftColumn, yPosition, 495, 35).fill(primaryColor);
      
      doc.fontSize(14)
         .fillColor('#ffffff')
         .text('TOTAL AMOUNT:', leftColumn + 10, yPosition + 10)
         .text(formatCurrency(quoteData.total_cost), leftColumn + 400, yPosition + 10);

      yPosition += 50;

      // Recurring charges section (if applicable)
      if (quoteData.recurring_cost && parseFloat(quoteData.recurring_cost) > 0) {
        yPosition += 10;
        
        // Warning box
        doc.rect(leftColumn, yPosition, 495, 80)
           .fillAndStroke('#fef3c7', '#f59e0b');

        yPosition += 15;
        doc.fontSize(12)
           .fillColor('#92400e')
           .font('Helvetica-Bold')
           .text('⚠️  RECURRING CHARGES', leftColumn + 15, yPosition);

        yPosition += 25;
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#78350f')
           .text(`${formatCurrency(quoteData.recurring_cost)} / ${quoteData.recurring_period}`, 
                 leftColumn + 15, yPosition);

        yPosition += 20;
        const recurringDesc = quoteData.recurring_description || 
          'This includes hosting, maintenance, and support services.';
        doc.fontSize(9)
           .text(recurringDesc, leftColumn + 15, yPosition, {
             width: 465,
             align: 'left'
           });

        yPosition += 40;
      }

      // Notes section (if provided)
      if (quoteData.notes) {
        yPosition += 15;
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor(primaryColor)
           .text('ADDITIONAL NOTES:', leftColumn, yPosition);

        yPosition += 20;
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor(textColor)
           .text(quoteData.notes, leftColumn, yPosition, {
             width: 495,
             align: 'left'
           });

        yPosition += 40;
      }

      // Payment terms
      yPosition += 20;
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor(textColor)
         .text('PAYMENT TERMS:', leftColumn, yPosition);

      yPosition += 15;
      doc.fontSize(9)
         .font('Helvetica')
         .text('• 50% deposit required to commence work', leftColumn + 10, yPosition);
      
      yPosition += 15;
      doc.text('• Balance payable upon project completion', leftColumn + 10, yPosition);
      
      yPosition += 15;
      doc.text('• Payment methods: Bank Transfer, M-Pesa, or Card', leftColumn + 10, yPosition);

      // Footer
      const footerY = doc.page.height - 80;
      doc.rect(0, footerY, doc.page.width, 80).fill(lightGray);

      doc.fontSize(9)
         .fillColor(textColor)
         .font('Helvetica')
         .text('PlanMorph Tech Consultancy', leftColumn, footerY + 20)
         .text('Email: info@planmorph.com | Phone: +254 700 000 000', leftColumn, footerY + 35)
         .text('Website: www.planmorph.com', leftColumn, footerY + 50);

      doc.fontSize(8)
         .fillColor('#6b7280')
         .text('Thank you for choosing PlanMorph Tech!', 
               rightColumn, footerY + 35, { align: 'right' });

      // Finalize the PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

export default generateInvoicePDF;
