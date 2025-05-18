#!/bin/bash
set -e

# Ensure node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm ci --only=production
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Make sure the application is built
echo "Building application..."
npm run build

# Verify dist/main.js exists
if [ ! -f "dist/main.js" ]; then
  echo "ERROR: Build failed - dist/main.js not found!"
  exit 1
fi

# Wait for database to be ready
echo "Waiting for database connection..."
# Try to connect to the database 5 times with exponential backoff
for i in $(seq 1 5); do
  sleep $((2**$i))
  if npx prisma db push --skip-generate; then
    echo "Database connection successful!"
    break
  fi
  echo "Attempt $i failed, retrying..."
  if [ $i -eq 5 ]; then
    echo "Could not connect to database after 5 attempts"
    exit 1
  fi
done

# Start the application
echo "Starting application..."
LOG_LEVEL=info node dist/main.js
