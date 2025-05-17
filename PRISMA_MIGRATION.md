# Migrating from TypeORM to Prisma ORM

This document outlines the steps needed to complete the migration from TypeORM to Prisma ORM for the Mlaku-Mulu Travel Agency API.

## Pre-requisites

1. Make sure your MySQL server is running
2. Create a database named `mlakumulu_db` (or the name specified in your .env file)
3. Update your .env file with the correct DATABASE_URL format for Prisma

## Step 1: Configure .env File

Make sure your `.env` file has the proper Prisma DATABASE_URL format:

```
# Replace with your actual database credentials
DATABASE_URL=mysql://username:password@localhost:3306/mlakumulu_db
```

Example:
```
DATABASE_URL=mysql://root:password@localhost:3306/mlakumulu_db
```

## Step 2: Generate Prisma Client

Generate the Prisma client based on your schema:

```bash
npm run prisma:generate
```

## Step 3: Create and Apply Migrations

Create and apply the initial database migration:

```bash
npm run prisma:migrate -- --name initial_migration
```

This will create a migration file in the `prisma/migrations` directory and apply it to your database.

## Step 4: Seed the Database (Optional)

Populate your database with initial test data:

```bash
npm run prisma:seed
```

## Step 5: Explore Your Database (Optional)

You can use Prisma Studio to explore and manage your database:

```bash
npm run prisma:studio
```

This will open a web interface at http://localhost:5555 where you can view and manage your data.

## Verifying the Migration

After completing these steps:

1. Start your application: `npm run start:dev`
2. Test API endpoints to ensure everything is working correctly
3. Check that database operations are functioning as expected

## Troubleshooting

- If you encounter errors with the DATABASE_URL, make sure your MySQL credentials are correct
- If migrations fail, check the error messages for clues about what went wrong
- For connection issues, verify that your MySQL server is running and accessible
