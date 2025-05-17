import { IsDecimal, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class TransactionDetailDto {
  @ApiProperty({
    description: 'Transaction detail unique identifier',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
    format: 'uuid'
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Amount for this specific transaction detail (may be a portion of the total transaction amount)',
    example: 1250.00,
    type: 'number'
  })
  @IsDecimal()
  amount: Decimal;

  @ApiProperty({
    description: 'Detailed description of what this transaction detail represents (e.g., specific trip component, fee, tax, etc.)',
    example: 'Payment for Bali Adventure to Ubud',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Date and time when the transaction detail was created',
    example: '2025-05-15T10:30:00.000Z',
    format: 'date-time'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the transaction detail was last updated',
    example: '2025-05-15T10:30:00.000Z',
    format: 'date-time'
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'ID of the parent transaction that this detail belongs to',
    example: '9b5e2b0c-6c86-4c60-a4c6-b2c665f735f2',
    format: 'uuid'
  })
  @IsUUID()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({
    description: 'ID of the trip associated with this transaction detail',
    example: 'c1d2e3f4-g5h6-i7j8-k9l0-m1n2o3p4q5r6',
    format: 'uuid'
  })
  @IsUUID()
  @IsNotEmpty()
  tripId: string;

  @ApiProperty({ description: 'Parent transaction information', required: false })
  transaction?: any;

  @ApiProperty({ description: 'Trip information', required: false })
  trip?: any;
}
