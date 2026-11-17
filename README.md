::: {align="center"}
# 🚀 BizHunt

### Find opportunities. Build relationships. Close deals.

**A smarter B2B sales workspace for managing leads, teams, follow-ups,
and customers --- all in one place.**

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.2-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/API-Django%20REST%20Framework-red)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
:::💡 What is BizHunt?
BizHunt is a B2B lead management and sales CRM platform built to
help businesses organize their sales process from the first prospect
record to a converted customer.

Instead of juggling spreadsheets, scattered notes, and disconnected
follow-up reminders, teams can use BizHunt to:
- Keep business leads organized in one searchable workspace.
- Assign leads to the right sales representatives and teams.
- Track every opportunity through a clear sales pipeline.
- Schedule email, WhatsApp, and phone follow-ups.
- Understand prospects using business, website, review, and contact
  information.
- Convert successful opportunities into customer accounts.
- Monitor sales performance with dashboards and analytics.
- Import leads from spreadsheets or external systems.
The goal: give sales teams a clear view of what needs attention, who
owns each opportunity, and how the business pipeline is performing.
✨ Why BizHunt?
  The challenge                       How BizHunt helps
  Leads are scattered across          Centralized lead workspace with
spreadsheets                        search and filters

  Nobody knows who owns a prospect    Team-based assignment, transfers,
and assignment history

  Follow-ups get forgotten            Scheduled follow-ups grouped into
overdue, today, and upcoming

  Sales progress is hard to measure   Pipeline stages, dashboards, and
conversion analytics

  Duplicate records waste time        Email, phone, and website-based
duplicate checks

  Successful deals disappear into     Convert a won lead into a customer
separate systems                    account

  Bulk lead entry is tedious          Excel, CSV, and external API
imports
Important changes are difficult to  Audit logs for key operational
trace                               actions
🧭 How the sales workflow works
        LEAD DISCOVERY
              │
              ▼
     IMPORT OR ADD LEADS
      Excel / CSV / API
              │
              ▼
       DOMAIN CLASSIFICATION
              │
              ▼
      TEAM ASSIGNMENT
     ┌────────┴─────────┐
     ▼                  ▼
 Assigned to a rep   Unassigned pool
     │                  │
     │             Admin distributes
     └────────┬─────────┘
              ▼
       SALES PIPELINE
              │
   New → Contacted → Replied
              │
   Interested → Meeting Scheduled
              │
   Proposal Sent → Negotiation
          ┌───┴───┐
          ▼       ▼
         WON     LOST
          │       │
          ▼       ▼
      CUSTOMER  LOSS REASON
       ACCOUNT   ANALYSIS
A lead cannot simply be marked as Won through an ordinary status
update. It must pass through the customer conversion workflow, which
creates the customer account and records the conversion.
🔥 Core features
1. 👥 Role-based access control
BizHunt has three application roles, each with a different level of
responsibility.
  Role                                What they can do
  Super Admin                     Manage users and roles, domains,
teams, organization-wide leads,
audit logs, and platform-level
workspaces

  Admin                           Manage domain types and teams,
create sales users, distribute
leads, and view organization-level
sales information
Lead User                       Work on assigned leads, update
pipeline stages, add notes,
schedule follow-ups, and convert
eligible leads into customers
Access is enforced by the backend, not just by hiding frontend pages.
2. 🎯 Lead management
Manage the full lifecycle of a business opportunity from one place.
- View My Leads, All Leads (for authorized roles),
  Unassigned Leads, Uploaded Leads, and Lost Leads.
- Search across business name, contact name, email, company, city, and
  state.
- Filter by status, domain, assignee, and acquisition source.
- Sort records by newest or oldest.
- Choose which columns appear in the lead table.
- View a detailed business profile and activity history.
- Add internal notes for team collaboration.
- Assign, transfer, or unassign leads according to role and team
  rules.
Nine pipeline stages
1. New
2. Contacted
3. Replied
4. Interested
5. Meeting Scheduled
6. Proposal Sent
7. Negotiation
8. Won
9. Lost
A lost lead requires a reason: Price, Competitor, Not Interested, No
Response, or Other.
3. 🧠 Business intelligence on every lead
A lead is more than a name and phone number. BizHunt's lead detail view
can bring together available enrichment information, including:
- Google Business Profile: rating, review count, Maps link, review
  link, and review highlights.
- Review sentiment: positive, neutral, or negative sentiment
  indicators.
- Website checks: website status, HTTPS/SSL, mobile
  responsiveness, page-speed score, and outdated-design indicators.
- Contact discovery: extracted email addresses, source, and email
  classification.
- Social profiles: links to discovered Facebook, Instagram,
  LinkedIn, and YouTube profiles.
- Business images: available logos, storefront images, and other
  business imagery.
- Local calling context: estimated prospect timezone based on
  location information.
The information shown depends on the data available for each lead.
4. 📅 Follow-up scheduling
Keep conversations moving and make the next action visible.
- Create follow-ups for Email, WhatsApp, and Phone Call.
- Set an exact due date and time.
- View tasks in three buckets: Overdue, Today, and
  Upcoming.
- Mark a follow-up as completed or delete it.
- Automatically keep the lead's next follow-up date aligned with its
  earliest pending task.
5. 🏢 Teams and lead distribution
Organize sales representatives around industry domains.
- Configure a team for each active domain type.
- Add sales representatives and admins to teams.
- Monitor active lead workloads by team member.
- View the domain's unassigned lead queue.
- Search and select leads for bulk assignment.
- Distribute leads to eligible team members.
- Preserve existing lead ownership when a member is removed from a
  team.
- Record assignment changes for traceability.
6. 📥 Bulk import: Excel and CSV
Bring existing prospect data into BizHunt without manually creating
every record.

Supported formats:
- .xlsx
- .xls
- .csv
The import process includes:
- Flexible column-header matching for common spreadsheet naming
  variations.
- Data cleanup for placeholder values and malformed contact details.
- Email and phone normalization.
- Duplicate checks against existing records and rows in the same
  upload.
- Domain selection for imported leads.
- Option to assign leads to an eligible user or leave them in the
  unassigned pool.
- An import summary with imported rows, skipped rows, and row-specific
  error reasons.
7. 🔌 External integrations and API imports
BizHunt can receive leads from other applications, such as web scrapers,
website forms, and marketing workflows.

The integration endpoints support:
- Structured JSON lead imports.
- Spreadsheet file imports.
- Server-side import-key verification.
- User credential and active-account validation.
- Data normalization and duplicate checks.
- Transactional bulk insertion and audit attribution.
This makes BizHunt useful as the destination for lead-generation tools
and other external workflows.
8. 🤝 Customer conversion and account management
When an opportunity is successfully closed, convert it into a customer
account.

The conversion workflow captures relevant commercial information, such
as:
- Customer requirements.
- Selected service or package.
- Primary contact person.
- Alternate contact number.
- Initial account notes.
BizHunt creates the customer record, marks the lead as Won, records the
conversion time, and logs the action. Customer records can then be
searched and updated according to the user's role and ownership scope.
9. 📊 Dashboard and sales analytics
Turn pipeline activity into information that teams can act on.

Dashboard and analytics views include:
- Total leads, new leads, won leads, and lost leads.
- Conversion rate.
- Active users, customers, domains, and teams (for authorized roles).
- Unassigned lead count.
- Seven-day Won vs. Lost trend.
- Distribution across pipeline stages.
- Lead acquisition source breakdown.
- Won vs. Lost comparison by source.
- Lost-deal reason analysis.
10. ☁️ Cloud file management
Keep sales documents organized in a user workspace.
- Store files using AWS S3.
- Upload files up to 25 MB each.
- Create nested folders and organize files.
- Move files between folders or to the root directory.
- Preview supported documents in the application.
- Generate short-lived presigned URLs for secure viewing and
  downloading.
- Allow Super Admins to inspect user workspaces.
11. 🧾 Audit logs and accountability
Important actions can be traced through the audit log system.

Recorded information includes the actor, affected entity, action,
previous and updated values, contextual metadata, and timestamp.

Examples of tracked activity include user activation changes, lead
creation and assignment, status changes, imports, domain and team
updates, and customer conversions.

Authorized administrators can search and filter the audit trail and
inspect before-and-after data.
🧰 Technology stack
Backend
  Technology              Purpose
  Python 3.12             Backend language
Django 5.2              Backend framework
Django REST Framework   REST API development
MySQL 8.0               Relational database
PyMySQL                 MySQL connectivity
PyJWT                   JWT token handling
Bcrypt                  Password hashing
OpenPyXL                Excel spreadsheet processing
Boto3                   AWS S3 integration
Frontend
  Technology        Purpose
  React 19          User interface
Vite              Frontend tooling and development server
Tailwind CSS v4   Styling
React Router v7   Client-side routing
Zustand           Application state management
Axios             API communication
Recharts          Charts and analytics
Framer Motion     UI animations
Lucide React      Icons
React Hot Toast   Notifications
🏗️ High-level architecture
┌─────────────────────────────────────────────┐
│              React 19 Frontend              │
│                                             │
│ Dashboard • Leads • Teams • Customers       │
│ Analytics • Follow-ups • File Workspace    │
└──────────────────────┬──────────────────────┘
                       │ HTTP / REST API
                       ▼
┌─────────────────────────────────────────────┐
│           Django REST Framework             │
│                                             │
│ Authentication & RBAC                      │
│ Lead & Customer Management                  │
│ Teams & Domain Management                   │
│ Imports & External Integrations             │
│ Follow-ups • Analytics • Audit Logs         │
└───────────────┬─────────────────┬───────────┘
                │                 │
                ▼                 ▼
       ┌────────────────┐  ┌────────────────┐
       │    MySQL 8     │  │    AWS S3      │
       │ Application    │  │ User documents │
       │ data           │  │ and files      │
       └────────────────┘  └────────────────┘
🔐 Security and data integrity
BizHunt includes several safeguards in its application workflows:
- Passwords are stored as bcrypt hashes; plaintext passwords are not
  stored.
- Authenticated API requests use signed JWT bearer tokens.
- Backend permissions enforce role-based access.
- External imports require a configured import key and valid user
  credentials.
- Import-key comparison uses a constant-time comparison function.
- Duplicate checks help prevent repeated lead records.
- Customer conversion and important bulk operations use controlled
  database workflows.
- Lead ownership and pipeline rules prevent invalid transitions.
- Presigned S3 URLs limit exposure of private file links.
- Audit logs provide a history of important operations.
🖥️ Application modules
  Module                              Purpose
  Dashboard                           Sales overview, KPIs, trends, and
follow-up visibility

  Leads                               Lead pipeline, business profiles,
search, filters, and actions

  Customers                           Converted customer directory and
account updates

  Domain Types                        Industry classification

  Teams                               Team membership and lead
distribution

  Analytics                           Conversion, acquisition, and
lost-deal insights

  Users                               User administration and access
control

  Activity Logs                       Administrative audit trail

  Profile                             User account information
File Workspace                      Document and folder management
🚀 Getting started
BizHunt is organized as a frontend-and-backend application.
Prerequisites
- Python 3.12
- Node.js (compatible with the frontend dependencies)
- MySQL 8.0
- Git
Backend setup
1. Open the backend project directory.
2. Create and activate a Python virtual environment.
3. Install the dependencies listed in requirements.txt.
4. Configure the required environment variables for your local
   database, Django settings, authentication, and any enabled
   integrations.
5. Apply Django database migrations.
6. Start the Django development server.
Example commands (run from the backend directory):
python -m venv venv

# Windows PowerShell
.\venv\Scripts\Activate.ps1

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
Create a local .env file for secrets and machine-specific
configuration. Do not commit .env or production credentials. Use a
separate, documented environment-variable template for sharing
configuration names safely.
Frontend setup
1. Open the frontend project directory.
2. Install the dependencies.
3. Configure the frontend API base URL for your backend.
4. Start the Vite development server.
npm install
npm run dev
Note: Exact environment-variable names, deployment settings, and
project-specific commands should be documented alongside the
corresponding frontend and backend configuration files.

⚙️ Configuration and integrations
Depending on which features are enabled in your deployment, BizHunt may
require configuration for:
- MySQL database connection.
- Django secret and allowed-host settings.
- JWT authentication.
- External lead-import security key.
- AWS S3 credentials, bucket, and region.
- Frontend API base URL.
Keep credentials in environment variables or a secrets manager. Never
add API keys, passwords, private keys, or production .env files to
Git.
🗺️ Project scope
This README describes the B2B CRM and lead lifecycle capabilities. The
separate Social Media Management suite is outside the scope of this
overview.
🤝 Contributing
Contributions, bug reports, and ideas are welcome.
1. Fork the repository.
2. Create a feature branch.
3. Make your changes and test them.
4. Commit with a clear message.
5. Open a pull request describing the change.
For substantial changes, explain the problem being solved and include
steps to verify the result.
📌 A note about the project
BizHunt brings lead generation workflows and day-to-day sales execution
together: capture prospects, organize them, assign ownership, follow
up consistently, understand performance, and turn opportunities into
customers.
::: {align="center"}
### Built to make every sales opportunity easier to manage. 🚀

**BizHunt --- Find. Track. Connect. Convert.**
:::