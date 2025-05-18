# Mlaku-Mulu Travel Agency REST API

A full-featured backend REST API for the Mlaku-Mulu travel agency, built with TypeScript, NestJS, and MySQL.

## Features

- JWT-based authentication with role-based access control
- Two user types: Employees and Tourists
- CRUD operations for tourist profiles and trips
- Transaction management for trip bookings and refunds
- Tourist feedback & rating system
- Trip report exports in PDF and CSV formats
- AI-powered sentiment analysis on feedback using OpenRouter API
- AI-powered trip recommendations based on tourist history

## Tech Stack

- **TypeScript**: Strongly typed programming language
- **NestJS**: Progressive Node.js framework
- **PostgreSQL**: Database with Prisma ORM integration
- **Prisma Accelerate**: Enhanced database performance
- **JWT**: Authentication and authorization
- **Swagger/OpenAPI**: API documentation
- **OpenRouter API**: AI-powered sentiment analysis and trip recommendations
- **PDF/CSV Export**: Report generation capabilities

## Prerequisites

- Node.js (v22+)
- npm or yarn
- PostgreSQL database

## Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/mlakumulutravel.git
   cd mlakumulutravel
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory using the `.env.example` template with your specific configurations.

4. **Set up the PostgreSQL database**:
   ```sql
   CREATE DATABASE mlakumulu_db;
   ```
   
   Or use a cloud-hosted PostgreSQL service like Supabase, Railway, or Neon.

5. **Build the application**:
   ```bash
   npm run build
   ```

## Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run start:prod
```

## API Documentation

The API is documented in the Postman collection (`mlakumulutravel_postman_collection.json`) provided in this repository. Import the collection into Postman to explore and test the available endpoints.

For detailed examples of transaction endpoints including request/response data, please refer to the [Transaction Endpoints Guide](./transaction-endpoints-guide.md).

### Using the Postman Collection

1. Import the Postman collection: `mlakumulutravel_postman_collection.json`
2. Import the Postman environment: `mlakumulutravel_environment.json`
3. Select the "Mlaku-Mulu Travel Environment" in Postman
4. Use the authentication endpoints to get a token
5. The environment variables will automatically be populated for testing other endpoints

Swagger documentation is available at: `http://localhost:3000/api/docs`

### Main Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get access token
- `GET /api/auth/profile` - Get current user profile

#### Tourists Management (Employee access)
- `GET /api/tourists` - Get all tourists
- `GET /api/tourists/:id` - Get tourist by ID
- `POST /api/tourists` - Create new tourist profile
- `PUT /api/tourists/:id` - Update tourist profile
- `DELETE /api/tourists/:id` - Delete tourist profile

#### Trips Management
- `GET /api/trips` - Get all trips (Employee access)
- `GET /api/trips/:id` - Get trip by ID
- `GET /api/trips/tourist/:touristId` - Get trips for a specific tourist
- `POST /api/trips` - Create new trip (Employee access)
- `PUT /api/trips/:id` - Update trip (Employee access)
- `DELETE /api/trips/:id` - Delete trip (Employee access)

#### Feedback
- `GET /api/feedback` - Get all feedback (Employee access)
- `GET /api/feedback/:id` - Get feedback by ID
- `GET /api/feedback/trip/:tripId` - Get feedback for a specific trip
- `GET /api/feedback/tourist/:touristId` - Get feedback from a specific tourist (Employee access)
- `POST /api/feedback` - Create new feedback
- `DELETE /api/feedback/:id` - Delete feedback (Employee access)

#### Transaction API

The transaction management system automatically creates transaction records when trips are added or removed by employees. Transactions are view-only and cannot be directly created, updated, or deleted through the API.

- `GET /api/transactions`: Get all transactions (employees only)
- `GET /api/transactions/:id`: Get a transaction by ID
- `GET /api/transactions/tourist/:touristId`: Get all transactions for a tourist
- `GET /api/transactions/trip/:tripId`: Get all transactions for a trip
- `GET /api/transactions/:id/details`: Get details for a transaction

#### Transaction Flow

1. **New Trip Creation**:
   - When an employee adds a trip for a tourist, a new transaction is automatically created
   - The transaction status is set to PENDING by default
   - Transaction details record the trip cost and link to the trip record

2. **Trip Cancellation/Refund**:
   - When an employee removes a trip, a refund transaction is automatically created
   - The refund transaction references the original transaction
   - The status is set to REFUNDED

3. **Transaction Status Types**:
   - PENDING: Initial state when transaction is created
   - COMPLETED: Payment has been fully processed
   - FAILED: Payment processing failed
   - REFUNDED: Payment has been refunded
   
   Each transaction has a unique reference number generated using UUID.

4. **Payment Methods**:
   - CREDIT_CARD: Credit card payment
   - BANK_TRANSFER: Direct bank transfer
   - PAYPAL: PayPal payment
   - CASH: Cash payment

#### Reports
- `POST /api/reports/export` - Export trip reports in PDF or CSV format

## Additional Features

### AI-Powered Trip Recommendations

The system uses artificial intelligence to analyze a tourist's past trips and provide personalized destination recommendations:

- `GET /api/trips/recommendation/:touristId` - Get AI-generated trip recommendations for a specific tourist

## Database Schema

1. **users**
   - id (PK)
   - email
   - password (hashed)
   - firstName
   - lastName
   - role (enum: employee, tourist)
   - isActive
   - createdAt
   - updatedAt

2. **employees**
   - id (PK)
   - user_id (FK to users)
   - position
   - department
   - hireDate
   - employeeId

3. **tourists**
   - id (PK)
   - user_id (FK to users)
   - passportNumber
   - nationality
   - dateOfBirth
   - phoneNumber
   - address

4. **trips**
   - id (PK)
   - name
   - startDateTime
   - endDateTime
   - tripDestination (JSON)
   - description
   - price
   - tourist_id (FK to tourists)
   - createdAt
   - updatedAt

5. **feedback**
   - id (PK)
   - rating
   - comment
   - trip_id (FK to trips)
   - tourist_id (FK to tourists)
   - sentimentAnalysis_id (FK to sentiment_analysis)
   - createdAt
   - updatedAt

6. **sentiment_analysis**
   - id (PK)
   - sentiment (enum: positive, neutral, negative)
   - confidence
   - rawAnalysis (JSON)
   - createdAt

7. **transactions**
   - id (PK)
   - transactionDate
   - amount
   - status (enum: PENDING, COMPLETED, FAILED, REFUNDED)
   - paymentMethod (enum: CREDIT_CARD, BANK_TRANSFER, PAYPAL, CASH)
   - referenceNumber
   - notes
   - tourist_id (FK to tourists)
   - createdBy_id (FK to users)
   - createdAt
   - updatedAt

8. **transaction_details**
   - id (PK)
   - amount
   - description
   - transaction_id (FK to transactions)
   - trip_id (FK to trips, optional)
   - createdAt
   - updatedAt

## Testing

Run the tests:

```bash
npm test
```

Run e2e tests:

```bash
npm run test:e2e
```

The project includes a comprehensive test suite with 94 tests across 12 test suites, covering all major functionality including:

- Authentication and user management
- Tourist registration and profile management
- Trip creation, updates, and deletion
- Transaction creation and refunds when trips are added/removed
- Feedback submission and sentiment analysis
- Report generation

### Testing the Transaction System

Transactions are automatically created when trips are added or removed. To test this:

1. Login as an employee
2. Create a trip for a tourist - this will generate a PENDING transaction
3. View the transaction using the transaction endpoints
4. Remove the trip - this will generate a REFUNDED transaction
5. Verify both transactions exist in the system

## Deployment

### Railway Deployment

The application is fully compatible with Railway for easy deployment:

1. **Create a Railway Account**:
   - Sign up at [railway.app](https://railway.app)

2. **Install Railway CLI (Optional)**:
   ```bash
   npm i -g @railway/cli
   railway login
   ```

3. **Deploy from the Dashboard**:
   - From the Railway dashboard, click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically detect the project as a NestJS application

4. **Configure Environment Variables**:
   - Add the following environment variables in the Railway dashboard:
     - `DATABASE_URL`: This will be automatically configured if you add a PostgreSQL database
     - `JWT_SECRET`: Your JWT secret key
     - `JWT_EXPIRATION`: JWT token expiration time in seconds
     - `OPENROUTER_API_KEY`: Your OpenRouter API key for sentiment analysis
     - `NODE_ENV`: Set to "production"

5. **Add a Database**:
   - Click "+ New" and select "PostgreSQL"
   - Railway will automatically provision a PostgreSQL database
   - Railway will set the DATABASE_URL environment variable

6. **Run Database Migrations**:
   - In the Railway dashboard, go to your service settings
   - Add a "Service Command" with: `npx prisma migrate deploy && npm run start:prod`
   - This will ensure your database schema is applied before starting the application

7. **Configure Domain (Optional)**:
   - In your service settings, navigate to the "Settings" tab
   - Under "Domains", you can configure a custom domain or use the Railway-provided domain

8. **Monitor Application**:
   - Railway provides logs, metrics, and other monitoring tools in the dashboard

### Backend Deployment (Other Platforms)

The backend API can also be deployed to cloud platforms like Render, Heroku, or DigitalOcean.

### Backend Deployment with Netlify

Netlify can also be used to deploy the NestJS API as an alternative to Railway:

1. **Create a Netlify Account**:
   - Sign up at [netlify.com](https://www.netlify.com)

2. **Connect to Your Git Repository**:
   - Go to the Netlify dashboard and click "New site from Git"
   - Select your Git provider (GitHub, GitLab, or Bitbucket)
   - Authorize Netlify to access your repositories
   - Select the repository containing your NestJS API code

3. **Configure Build Settings**:
   - **Build command**: `npm run build` 
   - **Publish directory**: `dist` (this is where NestJS outputs compiled files)
   - **Node version**: Select Node.js v22+ to match the project requirements

4. **Environment Variables**:
   - Add necessary environment variables in Site settings > Build & deploy > Environment
   - Make sure to include database connection strings, API keys, and other required configuration

5. **Configure netlify.toml**:
   - Include proper Node.js version settings in `netlify.toml`
   - Configure serverless function settings as needed for API endpoints

6. **Deploy**:
   - Netlify will automatically build and deploy your API service

7. **Custom Domain (Optional)**:
   - Go to Domain settings
   - Add your custom domain or use the free Netlify subdomain

## License

This project is licensed under the ISC License.

## Author

Mlaku-Mulu Travel Agency