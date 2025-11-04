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

/**
 * Send talent application emails
 */
const sendTalentEmail = async (email, fullName, type, data = {}) => {
  try {
    let subject, htmlContent, textContent;

    switch (type) {
      case 'application_received':
        subject = '✅ Application Received - PlanMorph Tech';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: #ffffff; margin: 0;">Application Received!</h1>
            </div>
            <div style="padding: 40px; background: #ffffff;">
              <p style="color: #333; font-size: 16px;">Hi ${fullName},</p>
              <p style="color: #666; line-height: 1.6;">
                Thank you for applying to join the PlanMorph Tech team! We've received your application 
                and are excited to review your profile.
              </p>
              ${data.needsAssessment ? `
                <div style="background: #f0f4ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
                  <p style="color: #667eea; font-weight: bold; margin: 0 0 10px 0;">📝 Assessment Required</p>
                  <p style="color: #666; margin: 0;">
                    Based on your experience level, we may assign you a practical task to showcase your skills. 
                    You'll receive details within 2-3 business days.
                  </p>
                </div>
              ` : `
                <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
                  <p style="color: #10b981; font-weight: bold; margin: 0 0 10px 0;">✨ Your Portfolio Looks Great!</p>
                  <p style="color: #666; margin: 0;">
                    Our team will review your application and portfolio. If it's a good match, 
                    we'll reach out to schedule an interview.
                  </p>
                </div>
              `}
              <p style="color: #666; line-height: 1.6;">
                <strong>What's Next?</strong><br>
                • We'll review your application within 3-5 business days<br>
                • You'll hear from us via email regardless of the outcome<br>
                • Keep an eye on your inbox for updates
              </p>
              <p style="color: #666; line-height: 1.6;">
                Application ID: <strong>#${data.applicationId}</strong>
              </p>
            </div>
            <div style="background: #f7f7f7; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                Best of luck!<br>
                <strong>PlanMorph Tech Talent Team</strong>
              </p>
            </div>
          </div>
        `;
        textContent = `Hi ${fullName},\n\nThank you for applying to join the PlanMorph Tech team!\n\nApplication ID: #${data.applicationId}\n\nWe'll review your application and get back to you within 3-5 business days.\n\nBest regards,\nPlanMorph Tech`;
        break;

      case 'assessment_assigned':
        subject = '📝 Assessment Task Assigned - PlanMorph Tech';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: #ffffff; margin: 0;">Assessment Task</h1>
            </div>
            <div style="padding: 40px; background: #ffffff;">
              <p style="color: #333; font-size: 16px;">Hi ${fullName},</p>
              <p style="color: #666; line-height: 1.6;">
                We're impressed with your application! To better understand your skills, 
                we'd like you to complete a practical assessment task.
              </p>
              <div style="background: #f0f4ff; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #667eea; margin: 0 0 15px 0;">${data.taskTitle}</h3>
                <p style="color: #666; line-height: 1.6;">${data.taskDescription}</p>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                  <p style="color: #666; margin: 5px 0;">
                    <strong>Deadline:</strong> ${data.deadline}
                  </p>
                </div>
              </div>
              <p style="color: #666; line-height: 1.6;">
                <strong>Submission Instructions:</strong><br>
                • Upload your work to GitHub, CodePen, Figma, or similar<br>
                • Reply to this email with the link to your submission<br>
                • Include a brief explanation of your approach<br>
                • Submit before the deadline
              </p>
              <div style="background: #fff9e6; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  ⚠️ This is your opportunity to showcase your real-world skills. Take your time and do your best work!
                </p>
              </div>
              <p style="color: #666;">
                Questions? Reply to this email and we'll be happy to help.
              </p>
            </div>
            <div style="background: #f7f7f7; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                Good luck!<br>
                <strong>PlanMorph Tech Team</strong>
              </p>
            </div>
          </div>
        `;
        textContent = `Hi ${fullName},\n\nAssessment Task: ${data.taskTitle}\n\n${data.taskDescription}\n\nDeadline: ${data.deadline}\n\nPlease submit your work by replying to this email with your submission link.\n\nBest regards,\nPlanMorph Tech`;
        break;

      case 'interview_scheduled':
        subject = '📅 Interview Scheduled - PlanMorph Tech';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: #ffffff; margin: 0;">🎉 Interview Scheduled!</h1>
            </div>
            <div style="padding: 40px; background: #ffffff;">
              <p style="color: #333; font-size: 16px;">Hi ${fullName},</p>
              <p style="color: #666; line-height: 1.6;">
                Great news! We'd like to invite you for an interview. We're excited to learn more about you!
              </p>
              <div style="background: #f0fdf4; padding: 25px; margin: 25px 0; border-radius: 8px; border: 2px solid #10b981;">
                <h3 style="color: #059669; margin: 0 0 20px 0;">Interview Details</h3>
                <p style="color: #666; margin: 8px 0;">
                  <strong>Type:</strong> ${data.interviewType.replace('_', ' ').toUpperCase()}
                </p>
                <p style="color: #666; margin: 8px 0;">
                  <strong>Date & Time:</strong> ${data.scheduledAt}
                </p>
                <p style="color: #666; margin: 8px 0;">
                  <strong>Duration:</strong> ${data.duration} minutes
                </p>
                ${data.meetingLink ? `
                  <p style="color: #666; margin: 8px 0;">
                    <strong>Meeting Link:</strong><br>
                    <a href="${data.meetingLink}" style="color: #667eea; word-break: break-all;">${data.meetingLink}</a>
                  </p>
                ` : ''}
                ${data.location ? `
                  <p style="color: #666; margin: 8px 0;">
                    <strong>Location:</strong> ${data.location}
                  </p>
                ` : ''}
              </div>
              <p style="color: #666; line-height: 1.6;">
                <strong>Tips to Prepare:</strong><br>
                • Review your portfolio and be ready to discuss your projects<br>
                • Test your internet connection and audio/video setup<br>
                • Prepare questions about the role and our team<br>
                • Have examples of your best work ready to share
              </p>
              <p style="color: #666; line-height: 1.6;">
                If you need to reschedule, please reply to this email as soon as possible.
              </p>
            </div>
            <div style="background: #f7f7f7; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                See you soon!<br>
                <strong>PlanMorph Tech Team</strong>
              </p>
            </div>
          </div>
        `;
        textContent = `Hi ${fullName},\n\nYour interview has been scheduled!\n\nType: ${data.interviewType}\nDate & Time: ${data.scheduledAt}\nDuration: ${data.duration} minutes\n${data.meetingLink ? `Meeting Link: ${data.meetingLink}\n` : ''}${data.location ? `Location: ${data.location}\n` : ''}\n\nSee you soon!\nPlanMorph Tech`;
        break;

      case 'accepted':
        subject = '🎊 Welcome to PlanMorph Tech!';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 50px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🎉 Congratulations!</h1>
            </div>
            <div style="padding: 40px; background: #ffffff;">
              <p style="color: #333; font-size: 18px;">Hi ${fullName},</p>
              <p style="color: #666; line-height: 1.8; font-size: 16px;">
                We're thrilled to offer you a position at <strong>PlanMorph Tech</strong>! 
                Your skills, experience, and passion really impressed us.
              </p>
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #e6f7ff 100%); padding: 30px; margin: 30px 0; border-radius: 12px; text-align: center;">
                <h2 style="color: #059669; margin: 0 0 15px 0;">Welcome to the Team! 🚀</h2>
                <p style="color: #666; margin: 0;">You're now part of something special.</p>
              </div>
              <p style="color: #666; line-height: 1.6;">
                <strong>Next Steps:</strong><br>
                • We'll send you a formal offer letter within 24 hours<br>
                • Our HR team will contact you regarding onboarding<br>
                • Start preparing for your exciting journey with us!
              </p>
              <p style="color: #666; line-height: 1.6;">
                We can't wait to see the amazing things you'll create with us!
              </p>
            </div>
            <div style="background: #f7f7f7; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                Welcome aboard!<br>
                <strong>PlanMorph Tech Family</strong>
              </p>
            </div>
          </div>
        `;
        textContent = `Hi ${fullName},\n\nCongratulations! We're thrilled to offer you a position at PlanMorph Tech!\n\nYou'll receive a formal offer letter within 24 hours. Our HR team will contact you soon regarding onboarding.\n\nWelcome to the team!\nPlanMorph Tech`;
        break;

      case 'rejected':
        subject = 'Thank You for Your Application - PlanMorph Tech';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: #ffffff; margin: 0;">Thank You</h1>
            </div>
            <div style="padding: 40px; background: #ffffff;">
              <p style="color: #333; font-size: 16px;">Hi ${fullName},</p>
              <p style="color: #666; line-height: 1.6;">
                Thank you for taking the time to apply for a position at PlanMorph Tech 
                and for your interest in joining our team.
              </p>
              <p style="color: #666; line-height: 1.6;">
                After careful consideration, we've decided to move forward with other candidates 
                whose experience more closely matches our current needs. This was a difficult decision, 
                as we received many strong applications.
              </p>
              <p style="color: #666; line-height: 1.6;">
                We encourage you to keep building your skills and portfolio. We'd love to see you 
                apply again in the future when you have more experience or when we have positions 
                that better match your strengths.
              </p>
              <p style="color: #666; line-height: 1.6;">
                We wish you all the best in your career journey!
              </p>
            </div>
            <div style="background: #f7f7f7; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                Best wishes,<br>
                <strong>PlanMorph Tech Team</strong>
              </p>
            </div>
          </div>
        `;
        textContent = `Hi ${fullName},\n\nThank you for applying to PlanMorph Tech. After careful consideration, we've decided to move forward with other candidates at this time.\n\nWe encourage you to apply again in the future.\n\nBest wishes,\nPlanMorph Tech`;
        break;

      default:
        throw new Error('Invalid email type');
    }

    const mailOptions = {
      from: `"PlanMorph Tech Careers" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent,
      text: textContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Talent email sent:', info.messageId);

    // Log communication in database
    // This would be done in the route handler

  } catch (error) {
    console.error('Error sending talent email:', error);
    throw new Error('Failed to send talent email');
  }
};

/**
 * Send support ticket emails
 */
const sendSupportTicketEmail = async (email, fullName, type, data = {}) => {
  try {
    const transporter = createTransporter();
    let subject, htmlContent, textContent;

    switch (type) {
      case 'ticket_created':
        subject = `✅ Support Ticket Created - ${data.ticketNumber}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0;">✅ Ticket Created</h1>
            </div>
            <div style="padding: 40px; background: #ffffff;">
              <p style="color: #333; font-size: 16px;">Hi ${fullName},</p>
              <p style="color: #666; line-height: 1.6;">
                Thank you for contacting PlanMorph Tech support. We've received your ticket and our team will respond within <strong>${data.slaHours} hours</strong>.
              </p>
              <div style="background: #f0f4ff; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #667eea;">
                <h3 style="color: #667eea; margin: 0 0 15px 0;">Ticket Details</h3>
                <p style="color: #666; margin: 8px 0;"><strong>Ticket Number:</strong> ${data.ticketNumber}</p>
                <p style="color: #666; margin: 8px 0;"><strong>Subject:</strong> ${data.subject}</p>
                <p style="color: #666; margin: 8px 0;"><strong>Category:</strong> ${data.category.replace('_', ' ')}</p>
                <p style="color: #666; margin: 8px 0;"><strong>Status:</strong> Open</p>
              </div>
              <p style="color: #666; line-height: 1.6;">
                <strong>To check your ticket status or add more information:</strong><br>
                Visit our support portal at <a href="${process.env.FRONTEND_URL || 'https://tech.planmorph.software'}/support" style="color: #667eea;">tech.planmorph.software/support</a> and enter your ticket number.
              </p>
              <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  💡 <strong>Tip:</strong> Please keep this email for reference. You'll need your ticket number to track progress.
                </p>
              </div>
            </div>
            <div style="background: #f7f7f7; padding: 20px; text-align: center;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                <strong>PlanMorph Tech Support</strong><br>
                ${process.env.EMAIL_USER}
              </p>
            </div>
          </div>
        `;
        textContent = `Hi ${fullName},\n\nYour support ticket has been created!\n\nTicket Number: ${data.ticketNumber}\nSubject: ${data.subject}\nCategory: ${data.category}\nExpected Response Time: ${data.slaHours} hours\n\nTo track your ticket, visit: ${process.env.FRONTEND_URL || 'https://tech.planmorph.software'}/support\n\nBest regards,\nPlanMorph Tech Support`;
        break;

      case 'status_updated':
        subject = `📝 Ticket Status Updated - ${data.ticketNumber}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0;">📝 Status Update</h1>
            </div>
            <div style="padding: 40px; background: #ffffff;">
              <p style="color: #333; font-size: 16px;">Hi ${fullName},</p>
              <p style="color: #666; line-height: 1.6;">
                Your support ticket <strong>${data.ticketNumber}</strong> has been updated.
              </p>
              <div style="background: #f0fdf4; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #10b981;">
                <p style="color: #666; margin: 8px 0;"><strong>New Status:</strong> <span style="color: #059669; text-transform: capitalize;">${data.status.replace('_', ' ')}</span></p>
                ${data.resolution_notes ? `
                  <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="color: #666; margin: 0 0 10px 0;"><strong>Resolution Notes:</strong></p>
                    <p style="color: #666; margin: 0; line-height: 1.6;">${data.resolution_notes}</p>
                  </div>
                ` : ''}
              </div>
              <p style="color: #666; line-height: 1.6;">
                You can view the full ticket details at: <a href="${process.env.FRONTEND_URL || 'https://tech.planmorph.software'}/support?ticket=${data.ticketNumber}" style="color: #667eea;">View Ticket</a>
              </p>
            </div>
            <div style="background: #f7f7f7; padding: 20px; text-align: center;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                <strong>PlanMorph Tech Support</strong>
              </p>
            </div>
          </div>
        `;
        textContent = `Hi ${fullName},\n\nYour ticket ${data.ticketNumber} status has been updated to: ${data.status}\n${data.resolution_notes ? `\nResolution Notes: ${data.resolution_notes}` : ''}\n\nBest regards,\nPlanMorph Tech Support`;
        break;

      case 'response_received':
        subject = `💬 New Response on Your Ticket - ${data.ticketNumber}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0;">💬 New Response</h1>
            </div>
            <div style="padding: 40px; background: #ffffff;">
              <p style="color: #333; font-size: 16px;">Hi ${fullName},</p>
              <p style="color: #666; line-height: 1.6;">
                Our support team has responded to your ticket <strong>${data.ticketNumber}</strong>.
              </p>
              <div style="background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb;">
                <p style="color: #666; line-height: 1.6; margin: 0;">${data.message}</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'https://tech.planmorph.software'}/support?ticket=${data.ticketNumber}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                  View & Reply
                </a>
              </div>
              <p style="color: #666; line-height: 1.6; font-size: 14px;">
                Please reply to this ticket if you need further assistance.
              </p>
            </div>
            <div style="background: #f7f7f7; padding: 20px; text-align: center;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                <strong>PlanMorph Tech Support</strong>
              </p>
            </div>
          </div>
        `;
        textContent = `Hi ${fullName},\n\nOur support team has responded to your ticket ${data.ticketNumber}.\n\nResponse:\n${data.message}\n\nView and reply at: ${process.env.FRONTEND_URL || 'https://tech.planmorph.software'}/support?ticket=${data.ticketNumber}\n\nBest regards,\nPlanMorph Tech Support`;
        break;

      default:
        throw new Error('Invalid email type');
    }

    const mailOptions = {
      from: `"PlanMorph Tech Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent,
      text: textContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Support ticket email sent:', info.messageId);

  } catch (error) {
    console.error('Error sending support ticket email:', error);
    throw new Error('Failed to send support ticket email');
  }
};

/**
 * Send notification to admin about new ticket
 */
const sendNewTicketNotification = async (ticketData) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `🎫 New Support Ticket: ${ticketData.ticketNumber} - ${ticketData.priority.toUpperCase()}`,
      html: `
        <h2>New Support Ticket Created</h2>
        <p><strong>Ticket Number:</strong> ${ticketData.ticketNumber}</p>
        <p><strong>Client:</strong> ${ticketData.clientName}</p>
        <p><strong>Email:</strong> ${ticketData.clientEmail}</p>
        <p><strong>Subject:</strong> ${ticketData.subject}</p>
        <p><strong>Category:</strong> ${ticketData.category}</p>
        <p><strong>Priority:</strong> ${ticketData.priority}</p>
        <p><strong>Client Plan:</strong> ${ticketData.plan}</p>
        <hr>
        <p><strong>Description:</strong></p>
        <p>${ticketData.description}</p>
      `,
      text: `New Support Ticket\n\nTicket: ${ticketData.ticketNumber}\nClient: ${ticketData.clientName}\nEmail: ${ticketData.clientEmail}\nSubject: ${ticketData.subject}\nCategory: ${ticketData.category}\nPriority: ${ticketData.priority}\nPlan: ${ticketData.plan}\n\nDescription:\n${ticketData.description}`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Admin ticket notification sent');

  } catch (error) {
    console.error('Error sending ticket notification:', error);
  }
};

/**
 * Send notification to admin about ticket update
 */
const sendTicketUpdateNotification = async (updateData) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `📬 Ticket Update: ${updateData.ticketNumber}`,
      html: `
        <h2>Ticket Update</h2>
        <p><strong>Ticket:</strong> ${updateData.ticketNumber}</p>
        <p><strong>Client:</strong> ${updateData.clientName}</p>
        <p><strong>Action:</strong> ${updateData.action}</p>
      `,
      text: `Ticket Update\n\nTicket: ${updateData.ticketNumber}\nClient: ${updateData.clientName}\nAction: ${updateData.action}`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending ticket update notification:', error);
  }
};

export default {
  sendQuoteEmail,
  sendNewRequestNotification,
  sendClientConfirmationEmail,
  sendPasswordResetEmail,
  sendTalentEmail,
  sendSupportTicketEmail,
  sendNewTicketNotification,
  sendTicketUpdateNotification
};
