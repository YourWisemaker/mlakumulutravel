# Transaction Endpoints Guide

This document provides example data and usage information for the Transaction endpoints in the Mlaku-Mulu Travel API.

## Overview

Transactions are automatically created when employees add or remove trips for tourists. The transaction module is designed to be view-only, with transaction creation handled through the trips module.

## Endpoints

### GET /api/transactions

Returns all transactions in the system, accessible by employees only.

#### Example Response:

```json
[
  {
    "id": "9b5e2b0c-6c86-4c60-a4c6-b2c665f735f2",
    "transactionDate": "2025-05-15T10:30:00.000Z",
    "amount": 1250.00,
    "status": "COMPLETED",
    "paymentMethod": "CREDIT_CARD",
    "referenceNumber": "REF-ABC12345",
    "notes": "Payment for trip: Bali Adventure",
    "touristId": "8f7e6d5c-4b3a-2c1d-0e9f-8g7h6i5j4k3l",
    "createdById": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "createdAt": "2025-05-15T10:30:00.000Z",
    "updatedAt": "2025-05-15T10:30:00.000Z",
    "createdByFirstName": "John",
    "createdByLastName": "Smith",
    "touristFirstName": "Jane",
    "touristLastName": "Doe"
  },
  {
    "id": "8c7d6e5f-4g3h-2i1j-0k9l-8m7n6o5p4q3r",
    "transactionDate": "2025-05-14T15:45:00.000Z",
    "amount": 850.00,
    "status": "PENDING",
    "paymentMethod": "BANK_TRANSFER",
    "referenceNumber": "REF-DEF67890",
    "notes": "Payment for trip: Singapore City Tour",
    "touristId": "2a3b4c5d-6e7f-8g9h-0i1j-2k3l4m5n6o7p",
    "createdById": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "createdAt": "2025-05-14T15:45:00.000Z",
    "updatedAt": "2025-05-14T15:45:00.000Z",
    "createdByFirstName": "John",
    "createdByLastName": "Smith",
    "touristFirstName": "Robert",
    "touristLastName": "Johnson"
  },
  {
    "id": "7d6e5f4g-3h2i-1j0k-9l8m-7n6o5p4q3r2s",
    "transactionDate": "2025-05-13T09:15:00.000Z",
    "amount": 1850.00,
    "status": "REFUNDED",
    "paymentMethod": "CREDIT_CARD",
    "referenceNumber": "REF-GHI12345",
    "notes": "Refund for cancelled trip: Tokyo Explorer",
    "touristId": "8f7e6d5c-4b3a-2c1d-0e9f-8g7h6i5j4k3l",
    "createdById": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "createdAt": "2025-05-13T09:15:00.000Z",
    "updatedAt": "2025-05-13T09:15:00.000Z",
    "createdByFirstName": "John",
    "createdByLastName": "Smith",
    "touristFirstName": "Jane",
    "touristLastName": "Doe"
  }
]
```

### GET /api/transactions/:id

Returns a single transaction by its ID.

#### Example Response:

```json
{
  "id": "9b5e2b0c-6c86-4c60-a4c6-b2c665f735f2",
  "transactionDate": "2025-05-15T10:30:00.000Z",
  "amount": 1250.00,
  "status": "COMPLETED",
  "paymentMethod": "CREDIT_CARD",
  "referenceNumber": "REF-ABC12345",
  "notes": "Payment for trip: Bali Adventure",
  "touristId": "8f7e6d5c-4b3a-2c1d-0e9f-8g7h6i5j4k3l",
  "createdById": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
  "createdAt": "2025-05-15T10:30:00.000Z",
  "updatedAt": "2025-05-15T10:30:00.000Z",
  "createdByFirstName": "John",
  "createdByLastName": "Smith",
  "touristFirstName": "Jane",
  "touristLastName": "Doe",
  "details": [
    {
      "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
      "amount": 1250.00,
      "description": "Payment for Bali Adventure to Ubud",
      "transactionId": "9b5e2b0c-6c86-4c60-a4c6-b2c665f735f2",
      "tripId": "c1d2e3f4-g5h6-i7j8-k9l0-m1n2o3p4q5r6",
      "createdAt": "2025-05-15T10:30:00.000Z",
      "updatedAt": "2025-05-15T10:30:00.000Z"
    }
  ]
}
```

### GET /api/transactions/tourist/:touristId

Returns all transactions for a specific tourist.

#### Example Response:

```json
[
  {
    "id": "9b5e2b0c-6c86-4c60-a4c6-b2c665f735f2",
    "transactionDate": "2025-05-15T10:30:00.000Z",
    "amount": 1250.00,
    "status": "COMPLETED",
    "paymentMethod": "CREDIT_CARD",
    "referenceNumber": "REF-ABC12345",
    "notes": "Payment for trip: Bali Adventure",
    "touristId": "8f7e6d5c-4b3a-2c1d-0e9f-8g7h6i5j4k3l",
    "createdById": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "createdAt": "2025-05-15T10:30:00.000Z",
    "updatedAt": "2025-05-15T10:30:00.000Z",
    "createdByFirstName": "John",
    "createdByLastName": "Smith",
    "touristFirstName": "Jane",
    "touristLastName": "Doe"
  },
  {
    "id": "7d6e5f4g-3h2i-1j0k-9l8m-7n6o5p4q3r2s",
    "transactionDate": "2025-05-13T09:15:00.000Z",
    "amount": 1850.00,
    "status": "REFUNDED",
    "paymentMethod": "CREDIT_CARD",
    "referenceNumber": "REF-GHI12345",
    "notes": "Refund for cancelled trip: Tokyo Explorer",
    "touristId": "8f7e6d5c-4b3a-2c1d-0e9f-8g7h6i5j4k3l",
    "createdById": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "createdAt": "2025-05-13T09:15:00.000Z",
    "updatedAt": "2025-05-13T09:15:00.000Z",
    "createdByFirstName": "John",
    "createdByLastName": "Smith",
    "touristFirstName": "Jane",
    "touristLastName": "Doe"
  }
]
```

### GET /api/transactions/trip/:tripId

Returns all transactions related to a specific trip.

#### Example Response:

```json
[
  {
    "id": "9b5e2b0c-6c86-4c60-a4c6-b2c665f735f2",
    "transactionDate": "2025-05-15T10:30:00.000Z",
    "amount": 1250.00,
    "status": "COMPLETED",
    "paymentMethod": "CREDIT_CARD",
    "referenceNumber": "REF-ABC12345",
    "notes": "Payment for trip: Bali Adventure",
    "touristId": "8f7e6d5c-4b3a-2c1d-0e9f-8g7h6i5j4k3l",
    "createdById": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "createdAt": "2025-05-15T10:30:00.000Z",
    "updatedAt": "2025-05-15T10:30:00.000Z",
    "createdByFirstName": "John",
    "createdByLastName": "Smith",
    "touristFirstName": "Jane",
    "touristLastName": "Doe"
  }
]
```

### GET /api/transactions/:id/details

Returns all details for a specific transaction.

#### Example Response:

```json
[
  {
    "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
    "amount": 1250.00,
    "description": "Payment for Bali Adventure to Ubud",
    "transactionId": "9b5e2b0c-6c86-4c60-a4c6-b2c665f735f2",
    "tripId": "c1d2e3f4-g5h6-i7j8-k9l0-m1n2o3p4q5r6",
    "createdAt": "2025-05-15T10:30:00.000Z",
    "updatedAt": "2025-05-15T10:30:00.000Z",
    "trip": {
      "id": "c1d2e3f4-g5h6-i7j8-k9l0-m1n2o3p4q5r6",
      "name": "Bali Adventure",
      "startDateTime": "2025-06-01T08:00:00.000Z",
      "endDateTime": "2025-06-07T16:00:00.000Z",
      "tripDestination": {
        "city": "Ubud",
        "country": "Indonesia",
        "coordinates": {
          "latitude": -8.506854,
          "longitude": 115.262504
        }
      },
      "price": 1250.00
    }
  }
]
```

## Transaction Flow Examples

### 1. New Trip Added by Employee

When an employee adds a new trip for a tourist:

1. A new trip record is created
2. A new transaction record is created with status PENDING and the trip amount
3. A transaction detail record is created linking the transaction to the trip

### 2. Trip Cancelled by Employee

When an employee removes a trip:

1. A new transaction record is created with status REFUNDED and the trip amount
2. A new transaction detail record is created with a negative amount (indicating refund)
3. The original trip record and its transaction details are deleted

## Status and Payment Method Enums

### Transaction Status
- PENDING
- COMPLETED
- FAILED
- REFUNDED

### Payment Method
- CREDIT_CARD
- BANK_TRANSFER
- PAYPAL
- CASH
