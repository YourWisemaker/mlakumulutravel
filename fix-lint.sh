#!/bin/bash

# This script fixes common ESLint warnings by prefixing unused variables with underscores

# Fix service variables in controller specs
find src -name "*.controller.spec.ts" -type f -exec sed -i '' 's/let service: /let _service: /g' {} \;
find src -name "*.controller.spec.ts" -type f -exec sed -i '' 's/service = module/\_service = module/g' {} \;

# Fix prismaService variables in service specs
find src -name "*.service.spec.ts" -type f -exec sed -i '' 's/let prismaService: /let _prismaService: /g' {} \;
find src -name "*.service.spec.ts" -type f -exec sed -i '' 's/prismaService = module/_prismaService = module/g' {} \;

# Fix sentimentService variable in feedback service spec
sed -i '' 's/let sentimentService: /let _sentimentService: /g' src/feedback/feedback.service.spec.ts
sed -i '' 's/sentimentService = module/_sentimentService = module/g' src/feedback/feedback.service.spec.ts

# Fix unused function args
find src -name "*.service.spec.ts" -type f -exec sed -i '' 's/mockImplementation((args) =>/mockImplementation((_args) =>/g' {} \;

# Fix unused imports in users.service.spec.ts
sed -i '' 's/import { CreateUserDto } from/import { CreateUserDto as _CreateUserDto } from/g' src/users/users.service.spec.ts
sed -i '' 's/import { UserRole } from/import { UserRole as _UserRole } from/g' src/users/users.service.spec.ts

# Fix unused imports in trips.service.spec.ts
sed -i '' 's/import { UpdateTripDto } from/import { UpdateTripDto as _UpdateTripDto } from/g' src/trips/trips.service.spec.ts

# Fix unused imports in reports.service.spec.ts
sed -i '' 's/import { NotFoundException } from/import { NotFoundException as _NotFoundException } from/g' src/reports/reports.service.spec.ts
sed -i '' 's/import { ReportFormat } from/import { ReportFormat as _ReportFormat } from/g' src/reports/reports.service.spec.ts

echo "Fixed ESLint warnings by prefixing unused variables with underscores"
