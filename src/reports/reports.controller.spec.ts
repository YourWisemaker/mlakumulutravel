import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ExportReportDto, ReportFormat } from './dto/export-report.dto';
import { HttpStatus } from '@nestjs/common';

// Create a manual mock for fs module
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  createReadStream: jest.fn().mockImplementation(() => ({
    pipe: jest.fn(),
  })),
  createWriteStream: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn(),
  })),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

describe('ReportsController', () => {
  let controller: ReportsController;
  let _service: ReportsService;

  const mockReportsService = {
    generateReport: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    _service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('exportReport', () => {
    it('should generate and stream a PDF report', async () => {
      const exportReportDto: ExportReportDto = {
        touristId: 'tourist1',
        format: ReportFormat.PDF,
      };
      
      const req = { 
        user: { 
          id: 'employee1', 
          role: 'employee' 
        } 
      };
      
      // Create a complete mock Response object with all needed methods
      const res = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis(),
      };
      
      const reportResult = {
        filePath: '/path/to/report.pdf',
        fileName: 'report.pdf',
      };
      
      mockReportsService.generateReport.mockResolvedValue(reportResult);
      
      await controller.exportReport(exportReportDto, req, res as any);
      
      expect(mockReportsService.generateReport).toHaveBeenCalledWith(
        exportReportDto.touristId,
        exportReportDto.format,
        req.user.id  // Include the userId parameter
      );
      
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition', 
        `attachment; filename=${reportResult.fileName}`
      );
    });

    it('should generate and stream a CSV report', async () => {
      const exportReportDto: ExportReportDto = {
        touristId: 'tourist1',
        format: ReportFormat.CSV,
      };
      
      const req = { 
        user: { 
          id: 'tourist1', 
          role: 'tourist' 
        } 
      };
      
      // Create a complete mock Response object with all needed methods
      const res = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis(),
      };
      
      const reportResult = {
        filePath: '/path/to/report.csv',
        fileName: 'report.csv',
      };
      
      mockReportsService.generateReport.mockResolvedValue(reportResult);
      
      await controller.exportReport(exportReportDto, req, res as any);
      
      expect(mockReportsService.generateReport).toHaveBeenCalledWith(
        exportReportDto.touristId,
        exportReportDto.format,
        req.user.id  // Include the userId parameter
      );
      
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition', 
        `attachment; filename=${reportResult.fileName}`
      );
    });

    it('should handle errors gracefully', async () => {
      const exportReportDto: ExportReportDto = {
        touristId: 'tourist1',
        format: ReportFormat.PDF,
      };
      
      const req = { user: { id: 'user1' } };
      const res = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
      
      const errorMessage = 'Failed to generate report';
      mockReportsService.generateReport.mockRejectedValue(new Error(errorMessage));
      
      await controller.exportReport(exportReportDto, req, res as any);
      
      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Failed to generate report', 
        error: errorMessage 
      });
    });
  });
});
