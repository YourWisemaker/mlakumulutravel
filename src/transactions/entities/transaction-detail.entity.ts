import { Decimal } from '@prisma/client/runtime/library';

export class TransactionDetail {
  id: string;
  amount: Decimal;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  
  transactionId: string;
  tripId: string;
  
  // Relations
  transaction?: any;
  trip?: any;
}
