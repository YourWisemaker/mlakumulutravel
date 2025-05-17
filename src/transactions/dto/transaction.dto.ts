import { IsDate, IsDecimal, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentMethod, TransactionStatus } from '../entities/transaction.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class TransactionDto {
  @ApiProperty({
    description: 'Transaction unique identifier',
    example: '9b5e2b0c-6c86-4c60-a4c6-b2c665f735f2',
    format: 'uuid'
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Date and time when the transaction was created',
    example: '2025-05-15T10:30:00.000Z',
    format: 'date-time'
  })
  @IsDate()
  transactionDate: Date;

  @ApiProperty({
    description: 'Total transaction amount in local currency',
    example: 1250.00,
    type: 'number'
  })
  @IsDecimal()
  amount: Decimal;

  @ApiProperty({ 
    description: 'Current status of the transaction (PENDING: initial state, COMPLETED: payment processed, FAILED: payment failed, REFUNDED: amount returned to customer)', 
    enum: TransactionStatus,
    example: TransactionStatus.COMPLETED,
    enumName: 'TransactionStatus'
  })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @ApiProperty({ 
    description: 'Payment method used for the transaction', 
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
    enumName: 'PaymentMethod'
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'External reference number if available', required: false })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiProperty({ description: 'Additional notes about the transaction', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Date when the transaction was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the transaction was last updated' })
  updatedAt: Date;

  @ApiProperty({ description: 'Tourist ID associated with this transaction' })
  @IsUUID()
  @IsNotEmpty()
  touristId: string;

  @ApiProperty({ description: 'User ID of the employee who created this transaction' })
  @IsUUID()
  @IsNotEmpty()
  createdById: string;

  @ApiProperty({ description: 'Tourist information', required: false })
  tourist?: any;

  @ApiProperty({ description: 'User who created the transaction', required: false })
  createdBy?: any;

  @ApiProperty({ description: 'Transaction details', required: false, type: [Object] })
  transactionDetails?: any[];
}
