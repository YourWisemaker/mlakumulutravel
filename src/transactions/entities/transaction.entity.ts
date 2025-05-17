import { Decimal } from '@prisma/client/runtime/library';


// Match exactly the Prisma enum values
export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED"
}

// Match exactly the Prisma enum values
export enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  PAYPAL = "PAYPAL",
  CASH = "CASH"
}

export class Transaction {
  id: string;
  transactionDate: Date;
  amount: Decimal;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  touristId: string;
  createdById: string;
  
  // Relations
  tourist?: any;
  createdBy?: any;
  transactionDetails?: any[];
}
