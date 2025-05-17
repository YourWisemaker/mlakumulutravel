#!/bin/bash

# Exit on error
set -e

echo "=== Mlaku-Mulu Travel Agency API Initialization ==="

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Creating .env file from .env.example..."
  cp .env.example .env
  echo "Please update the .env file with your database credentials and other settings."
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Install missing dependencies if needed
echo "Installing additional dependencies..."
npm install --save @nestjs/passport passport passport-jwt passport-local

# Build the application
echo "Building the application..."
npm run build

# Database setup instructions
echo "\n=== Database Setup ==="
DB_DATABASE=$(grep DB_DATABASE .env | cut -d '=' -f2)
echo "1. Make sure MySQL server is running"
echo "2. Create a database named '$DB_DATABASE' manually using your MySQL management tool"
echo "   (MySQL Workbench, phpMyAdmin, Sequel Pro, or similar)"
echo "3. Set up your DATABASE_URL in .env file for Prisma"
echo "   Example: DATABASE_URL=mysql://username:password@localhost:3306/$DB_DATABASE"

# Generate Prisma Client
echo "\n=== Generating Prisma Client ==="
npm run prisma:generate

# Ask if they want to run migrations
read -p "Would you like to run Prisma migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Running Prisma migrations..."
  npm run prisma:migrate
  
  echo "\n=== Seeding Database ==="
  read -p "Would you like to seed the database with initial data? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]
  then
    echo "Seeding database..."
    npm run prisma:seed
    echo "Database seeded successfully!"
  fi
fi

echo "\n"

# Ask if they want to run the application
read -p "Would you like to start the application now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "\nStarting the application in development mode..."
  npm run start:dev
else
  echo "\n=== Initialization completed! ==="
  echo "When you're ready, you can start the application with:"
  echo "npm run start:dev"
  echo "And access the API documentation at: http://localhost:3000/api/docs"
fi
