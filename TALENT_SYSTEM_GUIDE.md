# Talent Management System - Setup Guide

## 🎯 Overview
A comprehensive talent management system to recruit and manage developers and designers for PlanMorph Tech.

## 📋 Database Setup

1. **Run the SQL script on Digital Ocean Database:**
   - Open your Digital Ocean database console
   - Navigate to the SQL query editor
   - Copy the contents of `TALENT_TABLES.sql`
   - Execute the SQL commands
   - This will create 4 new tables:
     - `talent_applications` - Stores all job applications
     - `talent_assessments` - Tracks skills assessment tasks
     - `talent_interviews` - Manages interview scheduling
     - `talent_communications` - Logs all email communications

## 🚀 Features

### For Applicants (Hidden Career Page)
- **Access**: Visit `/careers` (not linked anywhere publicly)
- **Application Form** includes:
  - Personal & professional information
  - Portfolio links (GitHub, LinkedIn, Behance, Dribbble)
  - Skills and technologies
  - Notable projects showcase
  - Why they want to join
  - Availability preferences
  - Expected salary range (final compensation determined by admins based on project team size)
  
**Note**: All positions at PlanMorph are full-time. Applicants work full-time unless they have no active project.

### For Admins (Talent Dashboard)
- **Access**: Login → Click "Talent" button in admin dashboard
- **Features**:
  1. **Application Overview**
     - Stats cards showing totals by status
     - Filter by role (developer/designer/both)
     - Filter by status
     - Sortable table view
  
  2. **Application Management**
     - View full application details
     - Review portfolio and projects
     - Update application status
     - Add admin notes
  
  3. **Assessment System** (Backend Ready)
     - Assign coding/design tasks to applicants
     - Set deadlines
     - Track submissions
     - Grade and provide feedback
  
  4. **Interview Scheduling** (Backend Ready)
     - Schedule interviews
     - Send meeting links
     - Track interview outcomes
  
  5. **Email Notifications** (Automated)
     - Application received confirmation
     - Assessment assignment
     - Interview scheduling
     - Acceptance/Rejection letters

## 🔐 Security & Privacy

1. **Hidden from Public**
   - Career page at `/careers` is not linked in navigation
   - No robots/SEO indexing
   - Only accessible via direct URL

2. **Admin Only**
   - Talent dashboard requires admin authentication
   - Protected routes with JWT tokens

## 📧 Email Templates

The system sends professional HTML emails for:
- ✅ Application Received
- 📝 Assessment Assigned
- 📅 Interview Scheduled
- 🎉 Accepted (Welcome to Team)
- 📄 Rejected (Encouraging message)

## 🎨 Application Process Flow

1. **Application Submitted** → Auto status: `pending`
2. **Admin Reviews** → Status: `under_review`
3. **Path A: Experienced** → Status: `interview_scheduled` → `accepted`/`rejected`
4. **Path B: Less Experience** → Status: `assessment_assigned` → `assessment_submitted` → `interview_scheduled` → `accepted`/`rejected`

## 💡 Smart Assessment Detection

The system automatically flags applicants who need assessments based on:
- Experience level is "beginner"
- Less than 2 years of experience
- No portfolio URL provided

## 🔗 Key URLs

- **Careers Page**: `https://your-domain.com/careers`
- **Admin Talent Dashboard**: `https://your-domain.com/admin/talent`

## 📊 Database Schema Highlights

### talent_applications Table
- Stores: Personal info, professional details, portfolio links, skills, projects
- Status tracking: pending → under_review → interview → accepted/rejected
- Assessment flags and notes

### talent_assessments Table
- Task assignments with deadlines
- Submission tracking
- Scoring and feedback system

### talent_interviews Table
- Multiple interview types (phone, technical, cultural fit, final)
- Meeting links and locations
- Interview outcomes

### talent_communications Table
- Complete email history
- Delivery status tracking
- Audit trail of all communications

## 🎯 Usage Tips

1. **Share Career Link Privately**
   - Send `/careers` URL directly to interested candidates
   - Share on LinkedIn/Twitter when hiring
   - Add to job boards

2. **Assessment Best Practices**
   - Give 5-7 days for tasks
   - Make tasks realistic (2-4 hours work)
   - Provide clear requirements

3. **Interview Process**
   - Phone screening first
   - Technical/design review second
   - Cultural fit interview
   - Final decision interview

## 🚀 Deployment Status

- ✅ Database tables ready
- ✅ Backend API routes deployed
- ✅ Frontend pages deployed
- ✅ Email system configured
- ✅ Admin dashboard integrated

Access the system now at:
- **Frontend**: https://planmorph-tech-htu9k.ondigitalocean.app/careers
- **Admin**: https://planmorph-tech-htu9k.ondigitalocean.app/admin/talent

---

Built with ❤️ for PlanMorph Tech
