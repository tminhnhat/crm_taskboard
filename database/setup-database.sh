#!/bin/bash
# Database Setup Helper Script
# Usage: ./setup-database.sh [quick|full|docs-only]

set -e

echo "🚀 CRM Database Setup Helper"
echo "=============================="

# Check if argument provided
SETUP_TYPE=${1:-"quick"}

case $SETUP_TYPE in
    "quick")
        echo "📋 Setting up QUICK TESTING setup..."
        echo "   - Minimal tables for testing document generation"
        echo "   - Includes: document_templates, documents, customers (basic)"
        SQL_FILE="003_quick_setup.sql"
        ;;
    "docs-only") 
        echo "📋 Setting up DOCUMENT SYSTEM ONLY..."
        echo "   - Complete document and template management"
        echo "   - Includes: templates, documents with full features"
        SQL_FILE="002_document_template_core_fixed.sql"
        ;;
    "full")
        echo "📋 Setting up FULL CRM SYSTEM..."
        echo "   - All CRM tables and features"
        echo "   - Includes: customers, collaterals, credit_assessments, documents, templates, tasks, staff, products, contracts"
        SQL_FILE="001_create_crm_tables.sql"
        ;;
    *)
        echo "❌ Invalid setup type. Use: quick, docs-only, or full"
        exit 1
        ;;
esac

echo ""
echo "📄 SQL File to execute: $SQL_FILE"
echo ""

# Check if SQL file exists
if [ ! -f "migrations/$SQL_FILE" ]; then
    echo "❌ SQL file not found: migrations/$SQL_FILE"
    exit 1
fi

echo "🔧 Setup Options:"
echo "=================="
echo ""
echo "Option 1: Copy SQL to run in Supabase Dashboard"
echo "   1. Copy the SQL content below"
echo "   2. Go to your Supabase project → SQL Editor"
echo "   3. Paste and click 'Run'"
echo ""
echo "Option 2: Use Supabase CLI (if configured)"
echo "   supabase db push"
echo ""
echo "Option 3: Direct psql connection"
echo "   psql 'your-connection-string' -f migrations/$SQL_FILE"
echo ""

echo "📄 SQL CONTENT TO COPY:"
echo "======================="
echo ""
cat "migrations/$SQL_FILE"
echo ""
echo "======================="
echo ""

echo "✅ SQL content displayed above."
echo "Copy and paste into your Supabase SQL Editor, then click Run."
echo ""

echo "🔍 After running, verify with these queries:"
echo "SELECT table_name FROM information_schema.tables WHERE table_schema = 'dulieu_congviec';"
echo "SELECT COUNT(*) FROM document_templates;"
echo "SELECT COUNT(*) FROM documents;"
echo ""

echo "🎉 Database setup helper completed!"
echo "📚 See database/README.md for detailed instructions."
