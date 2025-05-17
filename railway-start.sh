#!/bin/bash
set -e

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

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
node dist/main.js
