#!/bin/bash

# Script to setup test database for API tests
# Run this script before running tests

echo "Setting up test database..."

# Database configuration
DB_HOST=${TEST_DB_HOST:-localhost}
DB_PORT=${TEST_DB_PORT:-5432}
DB_USER=${TEST_DB_USER:-postgres}
DB_PASSWORD=${TEST_DB_PASSWORD:-postgres}
DB_NAME=${TEST_DB_NAME:-nd_hw19_test}

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; then
    echo "❌ PostgreSQL is not running on $DB_HOST:$DB_PORT"
    echo "Please start PostgreSQL service and try again"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Create test database if it doesn't exist
echo "Creating test database if it doesn't exist..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME"

if [ $? -eq 0 ]; then
    echo "✅ Test database '$DB_NAME' is ready"
else
    echo "❌ Failed to create test database '$DB_NAME'"
    exit 1
fi

# Set environment variables for tests
export NODE_ENV=test
export TEST_DB_HOST=$DB_HOST
export TEST_DB_PORT=$DB_PORT
export TEST_DB_USER=$DB_USER
export TEST_DB_PASSWORD=$DB_PASSWORD
export TEST_DB_NAME=$DB_NAME
export JWT_SECRET=test-secret-key-for-api-tests

echo "✅ Test environment configured"
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo ""
echo "You can now run the tests with: npm test"
