#!/bin/bash
# Script to load expanded product catalog
# Run this after the initial database setup

set -euo pipefail

echo "🛒 Loading Expanded Product Catalog..."
echo "======================================="
echo ""

# Check if database exists
if [ -z "${1:-}" ]; then
    echo "Usage: ./load_products.sh [database-name]"
    echo "Example: ./load_products.sh hardware_ecommerce"
    exit 1
fi

DB_NAME="$1"
USER="${2:-root}"
PASSWORD="${3:-}"

echo "Database: $DB_NAME"
echo "User: $USER"
echo ""

# Construct MySQL command
if [ -z "$PASSWORD" ]; then
    MYSQL_CMD="mysql -u $USER"
else
    MYSQL_CMD="mysql -u $USER -p$PASSWORD"
fi

# Load the expanded seed data
echo "⏳ Loading 90+ products into database..."
$MYSQL_CMD "$DB_NAME" < expanded_seed_data.sql

echo ""
echo "✅ Product catalog loaded successfully!"
echo ""
echo "Product Summary:"
echo "  • Total Products: 90+"
echo "  • Categories: 10"
echo "  • Brands: 20"
echo "  • Total Stock: 2,200+ units"
echo ""
echo "To verify:"
echo "  SELECT COUNT(*) FROM products;"
echo ""
echo "📊 Ready to start selling!"
