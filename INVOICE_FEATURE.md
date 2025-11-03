# Invoice & Recurring Charges Feature

## Overview
Clients now receive a professional PDF invoice with their quotation email, and admins can specify recurring charges for hosting/maintenance services.

## What's New

### 1. PDF Invoice Attachment
- **Automatic Generation**: Every quotation automatically generates a professional PDF invoice
- **Branded Design**: Includes PlanMorph branding with gradient headers and professional layout
- **Comprehensive Details**: Shows:
  - Invoice number (e.g., PM-00001)
  - Client information
  - Project details
  - Complete cost breakdown
  - Timeline
  - Payment terms
  - Recurring charges warning (if applicable)

### 2. Recurring Charges
- **New Fields in Admin Dashboard**:
  - **Recurring Amount**: Monthly/quarterly/yearly cost
  - **Billing Period**: Choose from Monthly, Quarterly, Yearly, or None
  - **Description**: Explain what's included (hosting, maintenance, support, etc.)

- **Client Awareness**:
  - ⚠️ Prominent warning box in email highlighting recurring charges
  - Clearly displayed in PDF invoice
  - Automatic description if not provided
  - Visual emphasis to ensure clients don't miss this information

### 3. Email Enhancements
- **PDF Attachment**: Invoice automatically attached as `PlanMorph-Invoice-XXXXX.pdf`
- **Recurring Charges Section**: Yellow warning box in email if recurring charges exist
- **Professional Format**: HTML email with plain text fallback
- **Download Ready**: Client can download and save invoice immediately

## Admin Usage

### Creating Quotation with Recurring Charges

1. **Access Admin Dashboard**: Triple-click logo → Login
2. **Open Request**: Click "View Details" on any request
3. **Scroll to "Recurring Charges" Section** (yellow box)
4. **Fill in Details**:
   ```
   Recurring Amount: 5000 (KES per period)
   Billing Period: Monthly
   What's Included: Includes hosting, maintenance, security updates, and 24/7 support
   ```
5. **Create & Send**: Click button to send quotation

### Example Scenarios

**Website with Hosting**:
- Total Cost: KES 150,000 (one-time)
- Recurring: KES 5,000/month
- Description: "Includes cloud hosting, SSL certificate, daily backups, and technical support"

**E-commerce Platform**:
- Total Cost: KES 300,000 (one-time)
- Recurring: KES 15,000/month
- Description: "Includes hosting, payment gateway fees, inventory management, and priority support"

**Mobile App**:
- Total Cost: KES 500,000 (one-time)
- Recurring: KES 25,000/month
- Description: "Includes server hosting, API management, push notifications, and app store maintenance"

## Client Experience

### What Clients Receive

1. **Email with**:
   - Professional branded design
   - Full project quotation
   - Cost breakdown table
   - Timeline information
   - ⚠️ **RECURRING CHARGES** warning (if applicable)
   - PDF invoice attachment

2. **PDF Invoice with**:
   - Company branding
   - Invoice number for reference
   - Complete project details
   - Itemized cost breakdown
   - Prominent recurring charges section
   - Payment terms
   - Contact information

### Recurring Charges Display

In both email and PDF, clients see:
```
⚠️ RECURRING CHARGES
KES 5,000 / monthly

This includes hosting, maintenance, security updates, and technical 
support services. These charges will commence after the initial 
project delivery.

💡 These recurring services ensure your project stays secure, 
updated, and running smoothly.
```

## Database Schema

### New Columns in `quotations` Table:
```sql
recurring_cost DECIMAL(10, 2) DEFAULT 0
recurring_period VARCHAR(50) DEFAULT 'monthly'
recurring_description TEXT
```

### Valid Periods:
- `monthly` - Billed every month
- `quarterly` - Billed every 3 months
- `yearly` - Billed annually
- `none` - No recurring charges

## Technical Details

### Backend
- **PDF Generation**: `pdfkit` library
- **Service**: `backend/services/invoiceGenerator.js`
- **Email Service**: Updated `backend/services/emailService.js`
- **Routes**: `backend/routes/quoteRoutes.js` handles new fields

### Frontend
- **Form Fields**: Added in `RequestDetailsModal.jsx`
- **Validation**: Ensures proper data types and optional fields
- **UI**: Yellow-highlighted section for visibility

### Email Attachments
- **Filename Format**: `PlanMorph-Invoice-PM-XXXXX.pdf`
- **Content-Type**: `application/pdf`
- **Generation**: Real-time during email sending
- **Size**: Typically 50-150KB per invoice

## Best Practices

### For Admins:
1. **Always specify recurring charges** for projects requiring hosting/maintenance
2. **Be descriptive** in the recurring description - explain exact services included
3. **Choose appropriate period** - monthly for most web projects, yearly for domains
4. **Set realistic amounts** - consider actual hosting/maintenance costs

### Pricing Guidelines:
- **Basic Website**: KES 2,000-5,000/month
- **Business Website**: KES 5,000-10,000/month
- **E-commerce**: KES 10,000-25,000/month
- **Enterprise**: KES 25,000+/month

### Common Recurring Services:
- Cloud hosting & domain
- SSL certificates
- Daily backups
- Security monitoring
- Software updates
- Technical support
- Email services
- CDN services
- Database hosting

## Testing

### Test the Feature:
1. Create a new quote with recurring charges
2. Check client email (spam/inbox)
3. Download PDF attachment
4. Verify all information is correct
5. Confirm recurring charges are prominently displayed

### Sample Data:
```json
{
  "request_id": 1,
  "total_cost": 150000,
  "timeline_weeks": 8,
  "cost_breakdown": {
    "design": 30000,
    "development": 80000,
    "testing": 20000,
    "deployment": 20000
  },
  "notes": "Includes 2 rounds of revisions",
  "recurring_cost": 5000,
  "recurring_period": "monthly",
  "recurring_description": "Hosting, maintenance, and 24/7 support"
}
```

## Troubleshooting

### PDF Not Generated
- Check `pdfkit` package is installed
- Verify `invoiceGenerator.js` is present
- Check backend logs for errors

### Email Without Attachment
- Verify PDF generation completes before sending
- Check email service logs
- Ensure sufficient memory for PDF generation

### Recurring Charges Not Showing
- Verify database columns exist
- Check `recurring_cost > 0`
- Ensure `recurring_period` is not 'none'

## Future Enhancements

Potential improvements:
- [ ] Multiple currency support
- [ ] Automatic invoice numbering from sequence
- [ ] Invoice history/archive
- [ ] Resend invoice functionality
- [ ] Payment integration
- [ ] Recurring billing automation
- [ ] Client portal for invoice downloads

---

**Last Updated**: November 3, 2025
**Version**: 2.0
