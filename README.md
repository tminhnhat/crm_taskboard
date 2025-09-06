# Task, Customer, Product, Staff, Interaction, and Opportunity Management Frontend

A comprehensive management application built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Setup and Configuration

### Environment Variables

Before running the application, you need to configure Supabase connection. The application requires a `.env.local` file with the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
```

**To set up:**
1. Copy `.env.local.example` to `.env.local`
2. Replace the placeholder values with your actual Supabase project credentials
3. Restart the development server

**Important:** Without proper environment configuration, the application will show database connection errors on all pages, making it appear as if navigation is not working.

## Project Structure

```
src/
├── app/                # Next.js App Router
│   ├── customers/      # Customer management page
│   ├── products/       # Product management page
│   ├── staff/          # Staff management page
│   ├── interactions/   # Customer interactions page
│   ├── opportunities/  # Sales opportunities page
│   ├── contracts/      # Contract management page
│   ├── credit-assessments/ # Credit assessment management page
│   ├── collaterals/    # Collateral management page
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main tasks dashboard page
├── components/         # React components
│   ├── Navigation.tsx  # Main navigation component
│   ├── TaskCard.tsx    # Individual task display
│   ├── TaskForm.tsx    # Task creation/editing form
│   ├── TaskFilters.tsx # Task filtering controls
│   ├── CustomerCard.tsx    # Individual customer display
│   ├── CustomerForm.tsx    # Customer creation/editing form
│   ├── CustomerFilters.tsx # Customer filtering controls
│   ├── ProductCard.tsx     # Individual product display
│   ├── ProductForm.tsx     # Product creation/editing form
│   ├── ProductFilters.tsx  # Product filtering controls
│   ├── StaffCard.tsx       # Individual staff display
│   ├── StaffForm.tsx       # Staff creation/editing form
│   ├── StaffFilters.tsx    # Staff filtering controls
│   ├── InteractionCard.tsx # Individual interaction display
│   ├── InteractionForm.tsx # Interaction creation/editing form
│   ├── InteractionFilters.tsx # Interaction filtering controls
│   ├── OpportunityCard.tsx # Individual opportunity display
│   ├── OpportunityForm.tsx # Opportunity creation/editing form
│   ├── OpportunityFilters.tsx # Opportunity filtering controls
│   ├── ContractCard.tsx # Individual contract display
│   ├── ContractForm.tsx # Contract creation/editing form
│   ├── ContractFilters.tsx # Contract filtering controls
│   ├── CreditAssessmentCard.tsx # Individual credit assessment display
│   ├── CreditAssessmentForm.tsx # Credit assessment creation/editing form
│   ├── CreditAssessmentFilters.tsx # Credit assessment filtering controls
│   ├── CollateralCard.tsx # Individual collateral display
│   ├── CollateralForm.tsx # Collateral creation/editing form
│   ├── CollateralFilters.tsx # Collateral filtering controls
│   └── LoadingSpinner.tsx  # Loading states
├── hooks/              # Custom React hooks
│   ├── useTasks.ts     # Task management logic
│   ├── useCustomers.ts # Customer management logic
│   ├── useProducts.ts  # Product management logic
│   ├── useStaff.ts     # Staff management logic
│   ├── useInteractions.ts # Interaction management logic
│   ├── useOpportunities.ts # Opportunity management logic
│   ├── useContracts.ts # Contract management logic
│   ├── useCreditAssessments.ts # Credit assessment management logic
│   └── useCollaterals.ts # Collateral management logic
└── lib/                # Utilities and configurations
    └── supabase.ts     # Supabase client and types
```Management
- ✅ Full CRUD operations for tasks
- 📋 Task status management (Needs Action, In Progress, On Hold, Completed, Cancelled, Deleted)
- 🎯 Priority levels (Do first, Schedule, Delegate, Eliminate)
- 🏷️ Task categorization
- 📅 Due date and start date management
- 🔍 Search and filter functionality
- 📊 Task statistics dashboard
- 🔄 Sort by start date, due date, priority, status, etc.

### Customer Management
- 👥 Full CRUD operations for customers
- � Support for individual and corporate customers
- 📇 Comprehensive customer information (contact details, ID numbers, addresses)
- 🔢 Numerology data storage (JSONB)
- 📈 Customer statistics and analytics
- 🔍 Advanced search and filtering
- 📊 Status management (Active, Inactive, Suspended)

### Credit Assessment Management
- 🔍 Full CRUD operations for credit assessments
- 📊 Credit score tracking and management
- ✅ Assessment result management (Approved, Rejected, Pending, Conditional, Under Review)
- 👤 Customer and staff relationship tracking
- 📅 Assessment date management
- 📄 Document storage and linking
- 💬 Assessment comments and notes
- 🔧 Flexible metadata storage (JSONB)
- 📈 Assessment statistics and analytics
- ⭐ Visual credit score indicators with star ratings
- 🎯 Advanced filtering by score ranges, results, customers, and staff
- 📋 Assessment history tracking

### Collateral Management
- 🏠 Full CRUD operations for collateral assets
- 💰 Asset valuation tracking with currency formatting
- 📋 Multiple collateral types support (Real Estate, Vehicles, Savings, etc.)
- 📍 Location and address management
- 👤 Owner information tracking
- ⚖️ Legal status monitoring
- 📊 Collateral status management (Active, Frozen, Blocked, etc.)
- 📅 Valuation date tracking
- 🔧 Flexible metadata storage (JSONB) for documents and insurance info
- 📈 Collateral statistics and value analytics
- 🎯 Advanced filtering by type, status, value ranges, and dates
- 💱 Multi-currency value display with Vietnamese formatting

### General Features
- �🎨 Modern UI with Tailwind CSS
- ⚡ Real-time updates with Supabase
- 📱 Responsive design
- 🔄 Navigation between modules

## Database Schema

This frontend is designed to work with the following Supabase database schema:

### Tasks Table
```sql
CREATE SCHEMA dulieu_congviec;

CREATE TYPE dulieu_congviec.task_status_enum AS ENUM (
    'needsAction', 'inProgress', 'onHold', 'completed', 'cancelled', 'deleted'
);

CREATE TABLE dulieu_congviec.tasks (
    task_id SERIAL PRIMARY KEY,
    task_name TEXT NOT NULL,
    task_priority VARCHAR(20) CHECK (task_priority IN ('Do first', 'Schedule', 'Delegate', 'Eliminate')),
    task_time_process INTERVAL,
    task_date_start DATE,
    task_start_time TIME,
    task_category VARCHAR(100),
    task_note TEXT,
    task_due_date DATE,
    task_time_finish TIME,
    task_date_finish DATE,
    task_status dulieu_congviec.task_status_enum DEFAULT 'needsAction',
    calendar_event_id VARCHAR(255),
    sync_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timezone_offset INTEGER DEFAULT 7,
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    google_task_id VARCHAR(255)
);
```

### Customers Table
```sql
CREATE TABLE dulieu_congviec.customers (
    customer_id SERIAL PRIMARY KEY,
    customer_type VARCHAR(20) NOT NULL, -- 'individual' or 'corporate'
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    id_number VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    account_number VARCHAR(50) UNIQUE NOT NULL,
    numerology_data JSONB
);
```

### Products Table
```sql
CREATE TABLE dulieu_congviec.products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_type VARCHAR(100),
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'discontinued', 'draft')),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Staff Table
```sql
CREATE TABLE dulieu_congviec.staff (
    staff_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    position VARCHAR(50),
    department VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active'
);
```

### Interactions Table
```sql
CREATE TABLE dulieu_congviec.interactions (
    interaction_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES dulieu_congviec.customers(customer_id),
    staff_id INT REFERENCES dulieu_congviec.staff(staff_id),
    interaction_type VARCHAR(50), -- call, email, meeting, etc.
    interaction_date TIMESTAMP DEFAULT NOW(),
    notes TEXT
);
```

### Opportunities Table
```sql
CREATE TABLE dulieu_congviec.opportunities (
    opportunity_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES dulieu_congviec.customers(customer_id),
    product_id INT REFERENCES dulieu_congviec.products(product_id),
    staff_id INT REFERENCES dulieu_congviec.staff(staff_id),
    status VARCHAR(20), -- new, in_progress, won, lost
    expected_value NUMERIC(18,0),
    created_at TIMESTAMP DEFAULT NOW(),
    closed_at TIMESTAMP
);
```

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

### 1. Clone and Install

```bash
git clone <repository-url>
cd fontend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema provided above in your Supabase SQL editor
3. Ensure Row Level Security (RLS) is configured if needed

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                # Next.js App Router
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main dashboard page
├── components/         # React components
│   ├── TaskCard.tsx    # Individual task display
│   ├── TaskForm.tsx    # Task creation/editing form
│   ├── TaskFilters.tsx # Task filtering controls
│   └── LoadingSpinner.tsx # Loading states
├── hooks/              # Custom React hooks
│   └── useTasks.ts     # Task management logic
└── lib/                # Utilities and configurations
    └── supabase.ts     # Supabase client and types
```

## Key Features Explained

### Task Management
- ✅ Full CRUD operations for tasks
- 📋 Task status management (Needs Action, In Progress, On Hold, Completed, Cancelled, Deleted)
- 🎯 Priority levels (Do first, Schedule, Delegate, Eliminate)
- 🏷️ Task categorization
- 📅 Due date and start date management
- 🔍 Search and filter functionality
- 📊 Task statistics dashboard
- 🔄 Sort by start date, due date, priority, status, etc.

### Customer Management
- 👥 Full CRUD operations for customers
- 🏢 Support for individual and corporate customers
- 📇 Comprehensive customer information (contact details, ID numbers, addresses)
- 🔢 Numerology data storage (JSONB)
- 📈 Customer statistics and analytics
- 🔍 Advanced search and filtering
- 📊 Status management (Active, Inactive, Suspended)

### Product Management
- 📦 Full CRUD operations for products
- 🏷️ Product type categorization
- 📝 Rich product descriptions
- 📊 Status management (Active, Inactive, Discontinued, Draft)
- 🔍 Advanced search and filtering by name, type, and status
- 📈 Product statistics dashboard
- 🔧 Flexible metadata storage (JSONB)

### Staff Management
- 👤 Full CRUD operations for staff members
- 🏢 Department and position tracking
- 📞 Contact information management (email, phone)
- 📊 Status management (Active, Inactive, Suspended, Terminated)
- 🔍 Advanced search and filtering by name, department, position, and status
- 📈 Staff statistics dashboard
- 👥 Team member directory

### Customer Interaction Management
- 💬 Full CRUD operations for customer interactions
- 🔗 Links interactions to customers and staff members
- 📞 Multiple interaction types (calls, emails, meetings, chats, visits, support tickets, etc.)
- 📅 Automatic timestamp tracking
- 📝 Detailed notes and interaction history
- 🔍 Advanced filtering by customer, staff, interaction type, and date range
- 📊 Interaction statistics and trends
- 📈 Communication analytics dashboard

### Sales Opportunity Management
- 💰 Full CRUD operations for sales opportunities
- 🔗 Links opportunities to customers, products, and staff members
- 📊 Status tracking (New, In Progress, Won, Lost)
- 💵 Expected value and revenue tracking
- 📅 Automatic timestamp tracking for creation and closure
- 🔍 Advanced filtering by customer, product, staff, status, and value range
- 📈 Sales pipeline analytics and conversion rates
- 🏆 Revenue tracking and forecasting

### Credit Assessment Management
- 🔍 Full CRUD operations for credit assessments
- 📊 Credit score tracking and management
- ✅ Assessment result management (Approved, Rejected, Pending, Conditional, Under Review)
- 👤 Customer and staff relationship tracking
- 📅 Assessment date management
- 📄 Document storage and linking
- 💬 Assessment comments and notes
- 🔧 Flexible metadata storage (JSONB)
- 📈 Assessment statistics and analytics
- ⭐ Visual credit score indicators with star ratings
- 🎯 Advanced filtering by score ranges, results, customers, and staff
- 📋 Assessment history tracking

### Collateral Management
- 🏠 Full CRUD operations for collateral assets
- 💰 Asset valuation tracking with currency formatting
- 📋 Multiple collateral types support (Real Estate, Vehicles, Savings, etc.)
- 📍 Location and address management
- 👤 Owner information tracking
- ⚖️ Legal status monitoring
- 📊 Collateral status management (Active, Frozen, Blocked, etc.)
- 📅 Valuation date tracking
- 🔧 Flexible metadata storage (JSONB) for documents and insurance info
- 📈 Collateral statistics and value analytics
- 🎯 Advanced filtering by type, status, value ranges, and dates
- 💱 Multi-currency value display with Vietnamese formatting

### General Features
- 🎨 Modern UI with Tailwind CSS
- ⚡ Real-time updates with Supabase
- 📱 Responsive design
- 🔍 Advanced filtering and search capabilities
- 📊 Comprehensive statistics dashboards
- 🧭 Intuitive navigation between modules

### Status Workflows

#### Task Status Workflow
Tasks can progress through different statuses:
- **Needs Action** - Initial state for new tasks
- **In Progress** - Currently being worked on
- **On Hold** - Temporarily paused
- **Completed** - Finished tasks (auto-sets finish time)
- **Cancelled** - Abandoned tasks
- **Deleted** - Soft-deleted tasks

#### Product Status Workflow
Products can have the following statuses:
- **Draft** - Product in development/planning
- **Active** - Available and sellable product
- **Inactive** - Temporarily unavailable
- **Discontinued** - No longer available

#### Staff Status Workflow
Staff members can have the following statuses:
- **Active** - Current working employee
- **Inactive** - Temporarily not working (leave, etc.)
- **Suspended** - Temporarily suspended from duties
- **Terminated** - No longer employed

### Priority System
Based on the Eisenhower Matrix:
- **Do first** - Urgent and important
- **Schedule** - Important but not urgent
- **Delegate** - Urgent but not important
- **Eliminate** - Neither urgent nor important

### Filtering and Search
- Filter by status, priority, type, and other criteria
- Search by names, descriptions, and notes
- Real-time filtering with no page reload
- Active filter indicators and easy clearing

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Headless UI** - Unstyled, accessible UI components
- **Heroicons** - Beautiful hand-crafted SVG icons

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
