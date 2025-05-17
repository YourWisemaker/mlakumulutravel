import { Injectable, NotFoundException } from "@nestjs/common";
import { ReportFormat } from "./dto/export-report.dto";
import { PrismaService } from "../prisma/prisma.service";
import * as PDFDocument from "pdfkit";
import { createObjectCsvWriter } from "csv-writer";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateReport(
    touristId: string,
    format: ReportFormat,
  ): Promise<{ filePath: string; fileName: string }> {
    // Find the tourist with user information
    const tourist = await this.prisma.tourist.findUnique({
      where: { id: touristId },
      include: { user: true },
    });

    if (!tourist) {
      throw new NotFoundException(`Tourist with ID ${touristId} not found`);
    }

    // Find all trips for the tourist with feedback and sentiment analysis
    const trips = await this.prisma.trip.findMany({
      where: { touristId },
      include: {
        feedbacks: {
          include: {
            sentimentAnalysis: true,
          },
        },
      },
      orderBy: { startDateTime: "desc" },
    });

    if (trips.length === 0) {
      throw new NotFoundException(
        `No trips found for tourist with ID ${touristId}`,
      );
    }

    // Generate report based on format
    if (format === ReportFormat.PDF) {
      return this.generatePdfReport(tourist, trips);
    } else {
      return this.generateCsvReport(tourist, trips);
    }
  }

  private async generatePdfReport(
    tourist: any,
    trips: any[],
  ): Promise<{ filePath: string; fileName: string }> {
    // Ensure temp directory exists
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = `trip-report-${tourist.id}.pdf`;
    const filePath = path.join(tempDir, fileName);

    // Create PDF document
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Add document title
    doc.fontSize(25).text("Mlaku-Mulu Travel Agency", { align: "center" });
    doc.fontSize(18).text("Trip Report", { align: "center" });
    doc.moveDown();

    // Add tourist information
    doc
      .fontSize(14)
      .text(`Tourist: ${tourist.user.firstName} ${tourist.user.lastName}`);
    if (tourist.passportNumber) {
      doc.fontSize(12).text(`Passport: ${tourist.passportNumber}`);
    }
    if (tourist.nationality) {
      doc.fontSize(12).text(`Nationality: ${tourist.nationality}`);
    }
    doc.moveDown(2);

    // Add trip details
    doc.fontSize(16).text("Trip History", { underline: true });
    doc.moveDown();

    trips.forEach((trip, index) => {
      doc.fontSize(14).text(`Trip #${index + 1}: ${trip.name}`);
      doc
        .fontSize(12)
        .text(`Destination: ${JSON.stringify(trip.tripDestination)}`);
      doc.fontSize(12).text(`Start Date: ${trip.startDateTime.toISOString()}`);
      doc.fontSize(12).text(`End Date: ${trip.endDateTime.toISOString()}`);

      if (trip.price) {
        doc.fontSize(12).text(`Price: $${trip.price}`);
      }

      if (trip.description) {
        doc.fontSize(12).text(`Description: ${trip.description}`);
      }

      if (trip.feedbacks && trip.feedbacks.length > 0) {
        doc.moveDown();
        doc.fontSize(12).text("Feedback:");

        trip.feedbacks.forEach((feedback) => {
          doc.fontSize(10).text(`Rating: ${feedback.rating}/5`);
          doc.fontSize(10).text(`Comment: ${feedback.comment}`);

          if (feedback.sentimentAnalysis) {
            doc
              .fontSize(10)
              .text(`Sentiment: ${feedback.sentimentAnalysis.sentiment}`);
          }
        });
      }

      doc.moveDown(2);
    });

    // Add footer
    doc
      .fontSize(10)
      .text(`Report generated on ${new Date().toISOString()}`, {
        align: "center",
      });

    // Finalize the PDF
    doc.end();

    return new Promise((resolve) => {
      stream.on("finish", () => {
        resolve({ filePath, fileName });
      });
    });
  }

  private async generateCsvReport(
    tourist: any,
    trips: any[],
  ): Promise<{ filePath: string; fileName: string }> {
    // Ensure temp directory exists
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = `trip-report-${tourist.id}.csv`;
    const filePath = path.join(tempDir, fileName);

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: "tripName", title: "Trip Name" },
        { id: "destination", title: "Destination" },
        { id: "startDate", title: "Start Date" },
        { id: "endDate", title: "End Date" },
        { id: "price", title: "Price" },
        { id: "rating", title: "Rating" },
        { id: "feedback", title: "Feedback" },
        { id: "sentiment", title: "Sentiment" },
      ],
    });

    const records = [];

    trips.forEach((trip) => {
      if (trip.feedbacks && trip.feedbacks.length > 0) {
        trip.feedbacks.forEach((feedback) => {
          records.push({
            tripName: trip.name,
            destination: JSON.stringify(trip.tripDestination),
            startDate: trip.startDateTime.toISOString(),
            endDate: trip.endDateTime.toISOString(),
            price: trip.price || "N/A",
            rating: feedback.rating,
            feedback: feedback.comment,
            sentiment: feedback.sentimentAnalysis
              ? feedback.sentimentAnalysis.sentiment
              : "N/A",
          });
        });
      } else {
        records.push({
          tripName: trip.name,
          destination: JSON.stringify(trip.tripDestination),
          startDate: trip.startDateTime.toISOString(),
          endDate: trip.endDateTime.toISOString(),
          price: trip.price || "N/A",
          rating: "N/A",
          feedback: "N/A",
          sentiment: "N/A",
        });
      }
    });

    await csvWriter.writeRecords(records);

    return { filePath, fileName };
  }
}
