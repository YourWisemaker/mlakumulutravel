import { PrismaClient } from '@prisma/client';

// Define enums to match Prisma schema
enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  TOURIST = 'TOURIST',
}

enum SentimentType {
  POSITIVE = 'POSITIVE',
  NEUTRAL = 'NEUTRAL',
  NEGATIVE = 'NEGATIVE',
}
import * as bcrypt from 'bcrypt';

// Import transaction seeder
import { seedTransactions } from './seeds/transactions';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function seed() {
  console.log('Cleaning database...');
  
  // Clear existing data
  await prisma.feedback.deleteMany({});
  await prisma.sentimentAnalysis.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.tourist.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.user.deleteMany({});
  
  console.log('Seeding database...');
  
  // Create employee user
  const employeeUser = await prisma.user.create({
    data: {
      email: 'employee@mlakumulu.com',
      password: await hashPassword('password123'),
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.EMPLOYEE,
      isActive: true,
      employee: {
        create: {
          position: 'Tour Manager',
          department: 'Operations',
          hireDate: new Date('2022-01-15'),
          employeeId: 'EMP001'
        }
      }
    }
  });
  
  console.log(`Created employee: ${employeeUser.email}`);
  
  // Create tourist users
  const touristUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        password: await hashPassword('password123'),
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.TOURIST,
        isActive: true,
        tourist: {
          create: {
            passportNumber: 'AB123456',
            nationality: 'USA',
            dateOfBirth: new Date('1985-03-20'),
            phoneNumber: '+1234567890',
            address: '123 Main St, New York, NY'
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        password: await hashPassword('password123'),
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.TOURIST,
        isActive: true,
        tourist: {
          create: {
            passportNumber: 'CD789012',
            nationality: 'UK',
            dateOfBirth: new Date('1990-07-15'),
            phoneNumber: '+4423456789',
            address: '456 High St, London, UK'
          }
        }
      }
    })
  ]);
  
  console.log(`Created ${touristUsers.length} tourist users`);
  
  // Get the tourist IDs
  const tourists = await prisma.tourist.findMany({
    where: {
      userId: {
        in: touristUsers.map(user => user.id)
      }
    }
  });
  
  // Create trips for tourists
  const trips = await Promise.all([
    prisma.trip.create({
      data: {
        name: 'Bali Adventure',
        startDateTime: new Date('2023-06-15'),
        endDateTime: new Date('2023-06-25'),
        tripDestination: {
          city: 'Bali',
          country: 'Indonesia',
          coordinates: {
            latitude: -8.409518,
            longitude: 115.188919
          },
          attractions: ['Beach', 'Temple']
        },
        description: 'A wonderful trip to explore Bali',
        price: 1200.50,
        touristId: tourists[0].id
      }
    }),
    prisma.trip.create({
      data: {
        name: 'Tokyo Explorer',
        startDateTime: new Date('2023-07-10'),
        endDateTime: new Date('2023-07-20'),
        tripDestination: {
          city: 'Tokyo',
          country: 'Japan',
          coordinates: {
            latitude: 35.6762,
            longitude: 139.6503
          },
          attractions: ['Tokyo Tower', 'Shibuya Crossing', 'Meiji Shrine']
        },
        description: 'Discover the wonders of Tokyo',
        price: 1800.75,
        touristId: tourists[1].id
      }
    })
  ]);
  
  console.log(`Created ${trips.length} trips`);
  
  // Create sentiment analysis and feedback
  for (let i = 0; i < trips.length; i++) {
    const sentimentAnalysis = await prisma.sentimentAnalysis.create({
      data: {
        sentiment: i === 0 ? SentimentType.POSITIVE : SentimentType.NEUTRAL,
        confidence: i === 0 ? 0.85 : 0.65,
        rawAnalysis: {
          result: i === 0 ? 'positive' : 'neutral',
          score: i === 0 ? 0.85 : 0.65
        }
      }
    });
    
    await prisma.feedback.create({
      data: {
        rating: i === 0 ? 5 : 3,
        comment: i === 0 
          ? 'The trip was amazing! Everything was well-organized and the guides were excellent.'
          : 'The trip was decent. Some parts were good, others could use improvement.',
        tripId: trips[i].id,
        touristId: tourists[i].id,
        sentimentAnalysisId: sentimentAnalysis.id
      }
    });
  }
  
  console.log(`Created feedback and sentiment analysis for all trips`);
  
  // Seed transactions
  console.log('Seeding transactions...');
  await seedTransactions(prisma);
  
  console.log('Database seeding completed!');
}

seed()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
