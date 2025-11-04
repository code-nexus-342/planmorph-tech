import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateInvoicePDF } from './invoiceGenerator.js';

dotenv.config();

/**
 * Create reusable transporter object using SMTP
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Format currency to Kenyan Shillings
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Generate professional HTML email template for quotations
 */
const generateQuoteEmailTemplate = (clientName, quoteDetails, requestDetails) => {
  const { total_cost, timeline_weeks, cost_breakdown, notes } = quoteDetails;
  const { project_type, requirements } = requestDetails;

  // Parse cost breakdown if it's a string
  const breakdown = typeof cost_breakdown === 'string' 
    ? JSON.parse(cost_breakdown) 
    : cost_breakdown;

  let breakdownHTML = '';
  if (breakdown && typeof breakdown === 'object') {
    breakdownHTML = Object.entries(breakdown)
      .map(([key, value]) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151; text-transform: capitalize;">
            ${key.replace(/_/g, ' ')}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 600; text-align: right;">
            ${formatCurrency(value)}
          </td>
        </tr>
      `).join('');
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Project Quotation - PlanMorph Tech</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                    PlanMorph Tech
                  </h1>
                  <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500;">
                    AI-Powered Web Solutions
                  </p>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="padding: 40px 30px 30px;">
                  <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 600;">
                    Hello ${clientName},
                  </h2>
                  <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Thank you for considering PlanMorph Tech for your project. We've carefully reviewed your requirements and prepared a detailed quotation for you.
                  </p>
                </td>
              </tr>

              <!-- Project Details -->
              <tr>
                <td style="padding: 0 30px 30px;">
                  <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; border-radius: 8px;">
                    <h3 style="margin: 0 0 12px; color: #111827; font-size: 16px; font-weight: 600;">
                      Project Type
                    </h3>
                    <p style="margin: 0; color: #4b5563; font-size: 15px;">
                      ${project_type}
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Cost Breakdown -->
              ${breakdownHTML ? `
              <tr>
                <td style="padding: 0 30px 30px;">
                  <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">
                    Cost Breakdown
                  </h3>
                  <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    ${breakdownHTML}
                  </table>
                </td>
              </tr>
              ` : ''}

              <!-- Total & Timeline -->
              <tr>
                <td style="padding: 0 30px 30px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="width: 50%; padding-right: 10px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; text-align: center;">
                          <p style="margin: 0 0 8px; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
                            Total Investment
                          </p>
                          <p style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                            ${formatCurrency(total_cost)}
                          </p>
                        </div>
                      </td>
                      <td style="width: 50%; padding-left: 10px;">
                        <div style="background-color: #f9fafb; border: 2px solid #667eea; padding: 24px; border-radius: 12px; text-align: center;">
                          <p style="margin: 0 0 8px; color: #4b5563; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
                            Timeline
                          </p>
                          <p style="margin: 0; color: #111827; font-size: 32px; font-weight: 700;">
                            ${timeline_weeks} ${timeline_weeks === 1 ? 'Week' : 'Weeks'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Additional Notes -->
              ${notes ? `
              <tr>
                <td style="padding: 0 30px 30px;">
                  <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px;">
                    <h3 style="margin: 0 0 12px; color: #92400e; font-size: 16px; font-weight: 600;">
                      Additional Notes
                    </h3>
                    <p style="margin: 0; color: #78350f; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
                      ${notes}
                    </p>
                  </div>
                </td>
              </tr>
              ` : ''}

              <!-- Recurring Charges Warning -->
              ${quoteDetails.recurring_cost && parseFloat(quoteDetails.recurring_cost) > 0 ? `
              <tr>
                <td style="padding: 0 30px 30px;">
                  <div style="background-color: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 12px;">
                    <h3 style="margin: 0 0 12px; color: #92400e; font-size: 18px; font-weight: 700; display: flex; align-items: center;">
                      ⚠️ Recurring Charges
                    </h3>
                    <p style="margin: 0 0 12px; color: #78350f; font-size: 16px; font-weight: 600;">
                      ${formatCurrency(quoteDetails.recurring_cost)} / ${quoteDetails.recurring_period}
                    </p>
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                      ${quoteDetails.recurring_description || 'This includes hosting, maintenance, security updates, and technical support services. These charges will commence after the initial project delivery.'}
                    </p>
                    <p style="margin: 12px 0 0; color: #92400e; font-size: 13px; font-weight: 500;">
                      💡 These recurring services ensure your project stays secure, updated, and running smoothly.
                    </p>
                  </div>
                </td>
              </tr>
              ` : ''}

              <!-- CTA -->
              <tr>
                <td style="padding: 0 30px 40px; text-align: center;">
                  <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    We're excited to bring your vision to life! Reply to this email or reach out to us to discuss the next steps.
                  </p>
                  <a href="mailto:${process.env.EMAIL_USER}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                    Let's Get Started
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px; color: #111827; font-size: 16px; font-weight: 600;">
                    PlanMorph Tech
                  </p>
                  <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">
                    AI-Powered Web Solutions
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                    Email: ${process.env.EMAIL_USER}
                  </p>
                  <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px;">
                    This quotation is valid for 30 days from the date of issue.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Send quotation email to client with PDF invoice attachment
 * @param {string} to - Client email address
 * @param {object} quoteDetails - Quote details (id, total_cost, timeline_weeks, cost_breakdown, notes, recurring_cost, recurring_period, recurring_description, sent_at)
 * @param {object} requestDetails - Original request details (client_name, project_type, etc.)
 */
export const sendQuoteEmail = async (to, quoteDetails, requestDetails) => {
  try {
    const transporter = createTransporter();

    // Generate PDF invoice
    const pdfBuffer = await generateInvoicePDF(
      quoteDetails, 
      {
        client_name: requestDetails.client_name,
        client_email: to,
        client_phone: requestDetails.client_phone || 'N/A',
        company_name: requestDetails.company_name || ''
      },
      {
        project_type: requestDetails.project_type,
        requirements: requestDetails.requirements
      }
    );

    const invoiceNumber = `PM-${String(quoteDetails.id).padStart(5, '0')}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: to,
      subject: `Your Project Quotation from PlanMorph Tech - ${requestDetails.project_type}`,
      html: generateQuoteEmailTemplate(requestDetails.client_name, quoteDetails, requestDetails),
      // Plain text fallback
      text: `
Hello ${requestDetails.client_name},

Thank you for your interest in PlanMorph Tech!

Project Type: ${requestDetails.project_type}
Total Cost: ${formatCurrency(quoteDetails.total_cost)}
Timeline: ${quoteDetails.timeline_weeks} weeks

${quoteDetails.recurring_cost && parseFloat(quoteDetails.recurring_cost) > 0 ? `
⚠️ RECURRING CHARGES: ${formatCurrency(quoteDetails.recurring_cost)} / ${quoteDetails.recurring_period}
${quoteDetails.recurring_description || 'This includes hosting, maintenance, and support services.'}
` : ''}

${quoteDetails.notes ? `Notes:\n${quoteDetails.notes}\n\n` : ''}

Please find the detailed invoice attached as a PDF.

We look forward to working with you!

Best regards,
PlanMorph Tech
${process.env.EMAIL_USER}
      `.trim(),
      // Attach PDF invoice
      attachments: [
        {
          filename: `PlanMorph-Invoice-${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to: to,
      subject: mailOptions.subject,
      attachment: `PlanMorph-Invoice-${invoiceNumber}.pdf`
    });

    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send notification email to admin when new request is received
 */
export const sendNewRequestNotification = async (requestDetails) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Project Request: ${requestDetails.project_type}`,
      html: `
        <h2>New Project Request Received</h2>
        <p><strong>Client:</strong> ${requestDetails.client_name}</p>
        <p><strong>Email:</strong> ${requestDetails.client_email}</p>
        <p><strong>Phone:</strong> ${requestDetails.client_phone}</p>
        <p><strong>Company:</strong> ${requestDetails.company_name || 'N/A'}</p>
        <p><strong>Project Type:</strong> ${requestDetails.project_type}</p>
        <p><strong>Budget Range:</strong> ${requestDetails.budget_range || 'Not specified'}</p>
        <p><strong>Requirements:</strong></p>
        <p>${requestDetails.requirements}</p>
      `,
      text: `
New Project Request

Client: ${requestDetails.client_name}
Email: ${requestDetails.client_email}
Phone: ${requestDetails.client_phone}
Company: ${requestDetails.company_name || 'N/A'}
Project Type: ${requestDetails.project_type}
Budget Range: ${requestDetails.budget_range || 'Not specified'}

Requirements:
${requestDetails.requirements}
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    console.log('Admin notification sent');

  } catch (error) {
    console.error('Error sending admin notification:', error);
    // Don't throw - notification failure shouldn't block request creation
  }
};

/**
 * Send confirmation email to client when they submit a quote request
 */
export const sendClientConfirmationEmail = async (requestDetails) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: requestDetails.client_email,
      subject: `Thank You for Your Request - PlanMorph Tech`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Request Confirmation - PlanMorph Tech</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                        PlanMorph Tech
                      </h1>
                      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500;">
                        AI-Powered Web Solutions
                      </p>
                    </td>
                  </tr>

                  <!-- Success Icon -->
                  <tr>
                    <td style="padding: 40px 30px 20px; text-align: center;">
                      <div style="width: 80px; height: 80px; margin: 0 auto; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 48px; color: white;">✓</span>
                      </div>
                    </td>
                  </tr>

                  <!-- Greeting -->
                  <tr>
                    <td style="padding: 20px 30px 30px; text-align: center;">
                      <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 600;">
                        Request Received Successfully!
                      </h2>
                      <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Hello ${requestDetails.client_name},
                      </p>
                      <p style="margin: 16px 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Thank you for reaching out to PlanMorph Tech! We've received your project request and our team is excited to review it.
                      </p>
                    </td>
                  </tr>

                  <!-- Request Summary -->
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      <div style="background-color: #f9fafb; border: 2px solid #667eea; padding: 24px; border-radius: 12px;">
                        <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600; text-align: center;">
                          Your Request Summary
                        </h3>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">
                              Request ID:
                            </td>
                            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">
                              #${requestDetails.id}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">
                              Project Type:
                            </td>
                            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">
                              ${requestDetails.project_type}
                            </td>
                          </tr>
                          ${requestDetails.budget_range ? `
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">
                              Budget Range:
                            </td>
                            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">
                              ${requestDetails.budget_range}
                            </td>
                          </tr>
                          ` : ''}
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">
                              Status:
                            </td>
                            <td style="padding: 8px 0; text-align: right;">
                              <span style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                Under Review
                              </span>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>

                  <!-- What's Next -->
                  <tr>
                    <td style="padding: 0 30px 30px;">
                      <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">
                        What Happens Next?
                      </h3>
                      <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                        <li style="margin-bottom: 12px;">
                          <strong>Review:</strong> Our team will carefully analyze your requirements within 24 hours.
                        </li>
                        <li style="margin-bottom: 12px;">
                          <strong>Quotation:</strong> We'll prepare a detailed quote with cost breakdown and timeline.
                        </li>
                        <li style="margin-bottom: 12px;">
                          <strong>Discussion:</strong> We may reach out for clarification or to schedule a call.
                        </li>
                        <li>
                          <strong>Next Steps:</strong> Once approved, we'll kick off your project immediately!
                        </li>
                      </ol>
                    </td>
                  </tr>

                  <!-- Contact Info -->
                  <tr>
                    <td style="padding: 0 30px 40px;">
                      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px;">
                        <p style="margin: 0 0 12px; color: #92400e; font-size: 15px; font-weight: 600;">
                          📧 Have questions or need to update your request?
                        </p>
                        <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                          Simply reply to this email or contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #667eea; text-decoration: none; font-weight: 600;">${process.env.EMAIL_USER}</a>
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 8px; color: #111827; font-size: 16px; font-weight: 600;">
                        PlanMorph Tech
                      </p>
                      <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">
                        AI-Powered Web Solutions
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                        Email: ${process.env.EMAIL_USER}
                      </p>
                      <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px;">
                        We typically respond within 24 hours during business days.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
Hello ${requestDetails.client_name},

Request Received Successfully!

Thank you for reaching out to PlanMorph Tech! We've received your project request and our team is excited to review it.

YOUR REQUEST SUMMARY
━━━━━━━━━━━━━━━━━━━━
Request ID: #${requestDetails.id}
Project Type: ${requestDetails.project_type}
${requestDetails.budget_range ? `Budget Range: ${requestDetails.budget_range}` : ''}
Status: Under Review

WHAT HAPPENS NEXT?
━━━━━━━━━━━━━━━━━━━━
1. Review: Our team will carefully analyze your requirements within 24 hours.
2. Quotation: We'll prepare a detailed quote with cost breakdown and timeline.
3. Discussion: We may reach out for clarification or to schedule a call.
4. Next Steps: Once approved, we'll kick off your project immediately!

QUESTIONS?
━━━━━━━━━━━━━━━━━━━━
Simply reply to this email or contact us at ${process.env.EMAIL_USER}

Best regards,
PlanMorph Tech
AI-Powered Web Solutions

We typically respond within 24 hours during business days.
      `.trim(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Client confirmation email sent:', info.messageId);

  } catch (error) {
    console.error('Error sending client confirmation:', error);
    // Don't throw - confirmation failure shouldn't block request creation
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - PlanMorph Tech',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - PlanMorph Tech</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        PlanMorph Tech
                      </h1>
                      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                        Password Reset Request
                      </p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 600;">
                        Reset Your Password
                      </h2>
                      <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password for your PlanMorph Tech admin account. Click the button below to create a new password.
                      </p>

                      <!-- Reset Button -->
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                          Reset Password
                        </a>
                      </div>

                      <!-- Security Notice -->
                      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0;">
                        <p style="margin: 0 0 8px; color: #92400e; font-size: 14px; font-weight: 600;">
                          ⚠️ Security Notice
                        </p>
                        <p style="margin: 0; color: #78350f; font-size: 13px; line-height: 1.5;">
                          This link will expire in 1 hour. If you didn't request this password reset, please ignore this email or contact us if you have concerns.
                        </p>
                      </div>

                      <!-- Manual Link -->
                      <p style="margin: 24px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                        If the button doesn't work, copy and paste this link into your browser:
                      </p>
                      <p style="margin: 8px 0 0; color: #667eea; font-size: 12px; word-break: break-all;">
                        ${resetLink}
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 8px; color: #111827; font-size: 16px; font-weight: 600;">
                        PlanMorph Tech
                      </p>
                      <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">
                        AI-Powered Web Solutions
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                        Email: ${process.env.EMAIL_USER}
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
Password Reset Request - PlanMorph Tech

We received a request to reset your password for your admin account.

Click this link to reset your password (expires in 1 hour):
${resetLink}

If you didn't request this password reset, please ignore this email or contact us at ${process.env.EMAIL_USER}

Best regards,
PlanMorph Tech
AI-Powered Web Solutions
      `.trim(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);

  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

export default {
  sendQuoteEmail,
  sendNewRequestNotification,
  sendClientConfirmationEmail,
  sendPasswordResetEmail
};
