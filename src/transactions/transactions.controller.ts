import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransactionDto } from './dto/transaction.dto';
import { TransactionDetailDto } from './dto/transaction-detail.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get all transactions (employees only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all transactions with details',
    type: [TransactionDto],
  })
  async findAll() {
    return this.transactionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction details',
    type: TransactionDto,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Get('tourist/:touristId')
  @ApiOperation({ summary: 'Get transactions by tourist ID' })
  @ApiParam({ name: 'touristId', description: 'Tourist ID' })
  @ApiResponse({
    status: 200,
    description: 'List of transactions for a tourist',
    type: [TransactionDto],
  })
  async findByTouristId(@Param('touristId') touristId: string) {
    return this.transactionsService.findByTouristId(touristId);
  }

  @Get('trip/:tripId')
  @ApiOperation({ summary: 'Get transactions by trip ID' })
  @ApiParam({ name: 'tripId', description: 'Trip ID' })
  @ApiResponse({
    status: 200,
    description: 'List of transactions for a trip',
    type: [TransactionDto],
  })
  async findByTripId(@Param('tripId') tripId: string) {
    return this.transactionsService.findByTripId(tripId);
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Get transaction details by transaction ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'List of transaction details',
    type: [TransactionDetailDto],
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findTransactionDetails(@Param('id') id: string) {
    return this.transactionsService.findTransactionDetailsByTransactionId(id);
  }
}
