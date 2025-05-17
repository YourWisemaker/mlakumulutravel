import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export async function seedTransactions(prisma: PrismaClient) {
  // First, ensure we have some tourists and trips to associate with transactions
  const tourists = await prisma.tourist.findMany({
    include: {
      user: true,
    },
    take: 5,
  });

  const trips = await prisma.trip.findMany({
    take: 10,
  });

  // Get an employee user to be the creator of transactions
  const employeeUser = await prisma.user.findFirst({
    where: {
      role: 'EMPLOYEE',
    },
  });

  if (!tourists.length || !trips.length || !employeeUser) {
    console.log('Cannot seed transactions: Missing tourists, trips, or employees');
    return;
  }

  // Create sample transactions
  const transactions = [];
  // These strings must match the enum values defined in the Prisma schema
  const paymentMethods = ['CREDIT_CARD', 'BANK_TRANSFER', 'PAYPAL', 'CASH'] as const;
  const statuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] as const;

  console.log('Creating transactions and details...');

  for (let i = 0; i < 15; i++) {
    const tourist = tourists[Math.floor(Math.random() * tourists.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomPaymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const transactionAmount = parseFloat((Math.random() * 2000 + 500).toFixed(2)); // Random amount between 500 and 2500

    try {
      // Create transaction using raw SQL query
      const transactionDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000); // Random date in the last 30 days
      const transactionId = uuidv4();
      const refNum = `REF-${uuidv4().substring(0, 8).toUpperCase()}`;
      const notes = `Sample transaction for tourist ${tourist.user.firstName} ${tourist.user.lastName}`;
      
      // Insert transaction
      await prisma.$queryRaw`
        INSERT INTO "Transaction" (
          "id", "transactionDate", "amount", "status", "paymentMethod", 
          "referenceNumber", "notes", "touristId", "createdById", "createdAt", "updatedAt"
        ) VALUES (
          ${transactionId}, ${transactionDate}, ${transactionAmount}, ${randomStatus}, ${randomPaymentMethod},
          ${refNum}, ${notes}, ${tourist.id}, ${employeeUser.id}, ${transactionDate}, ${transactionDate}
        )
      `;
      
      // Store transaction in our array
      transactions.push({
        id: transactionId,
        transactionDate,
        amount: transactionAmount,
        status: randomStatus,
        paymentMethod: randomPaymentMethod,
        referenceNumber: refNum,
        notes,
        touristId: tourist.id,
        createdById: employeeUser.id
      });
      
      // Create 1-3 transaction details for each transaction
      const detailCount = Math.floor(Math.random() * 3) + 1;
      let totalDetailAmount = 0;
      
      for (let j = 0; j < detailCount; j++) {
        // Calculate individual detail amount, ensuring the sum matches the transaction amount
        let detailAmount;
        if (j === detailCount - 1) {
          // Last detail gets the remainder
          detailAmount = transactionAmount - totalDetailAmount;
        } else {
          // Random proportion of the remaining amount
          const remainingAmount = transactionAmount - totalDetailAmount;
          const proportion = Math.random() * 0.8; // Take up to 80% of remaining
          detailAmount = parseFloat((remainingAmount * proportion).toFixed(2));
          totalDetailAmount += detailAmount;
        }

        // Randomly select a trip for this detail, if available
        const trip = trips.length > 0 ? trips[Math.floor(Math.random() * trips.length)] : null;
        const tripDescription = trip ? `Payment for trip ${trip.name}` : `General payment service`;
        const detailId = uuidv4();
        const creationDate = new Date();

        // Create the transaction detail using raw SQL
        if (trip) {
          await prisma.$queryRaw`
            INSERT INTO "TransactionDetail" (
              "id", "amount", "description", "transactionId", "tripId", "createdAt", "updatedAt"
            ) VALUES (
              ${detailId}, ${detailAmount}, ${tripDescription}, 
              ${transactionId}, ${trip.id}, ${creationDate}, ${creationDate}
            )
          `;
        } else {
          await prisma.$queryRaw`
            INSERT INTO "TransactionDetail" (
              "id", "amount", "description", "transactionId", "createdAt", "updatedAt"
            ) VALUES (
              ${detailId}, ${detailAmount}, ${tripDescription}, 
              ${transactionId}, ${creationDate}, ${creationDate}
            )
          `;
        }
      }
      
      console.log(`Created transaction #${i+1} with ${detailCount} details`);
    } catch (error) {
      console.error(`Error creating transaction #${i+1}:`, error);
    }
  }

  console.log(`Created ${transactions.length} sample transactions with details`);
}
