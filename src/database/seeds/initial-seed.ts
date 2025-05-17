import { Connection } from "typeorm";
import * as bcrypt from "bcrypt";
import { User, UserRole } from "../../users/entities/user.entity";
import { Employee } from "../../users/entities/employee.entity";
import { Tourist } from "../../tourists/entities/tourist.entity";
import { Trip } from "../../trips/entities/trip.entity";
import { Feedback } from "../../feedback/entities/feedback.entity";
import {
  SentimentAnalysis,
  SentimentType,
} from "../../sentiment/entities/sentiment-analysis.entity";

export const initialSeed = async (connection: Connection) => {
  // Clear all existing data (in reverse order to avoid foreign key constraints)
  await connection.query("SET FOREIGN_KEY_CHECKS = 0");
  await connection.query("TRUNCATE TABLE feedback");
  await connection.query("TRUNCATE TABLE trips");
  await connection.query("TRUNCATE TABLE sentiment_analysis");
  await connection.query("TRUNCATE TABLE tourists");
  await connection.query("TRUNCATE TABLE employees");
  await connection.query("TRUNCATE TABLE users");
  await connection.query("SET FOREIGN_KEY_CHECKS = 1");

  // Create users
  const employeeUser = new User();
  employeeUser.email = "employee@mlakumulu.com";
  employeeUser.password = await bcrypt.hash("password123", 10);
  employeeUser.firstName = "John";
  employeeUser.lastName = "Admin";
  employeeUser.role = UserRole.EMPLOYEE;
  await connection.manager.save(employeeUser);

  const touristUser1 = new User();
  touristUser1.email = "tourist1@example.com";
  touristUser1.password = await bcrypt.hash("password123", 10);
  touristUser1.firstName = "Alice";
  touristUser1.lastName = "Smith";
  touristUser1.role = UserRole.TOURIST;
  await connection.manager.save(touristUser1);

  const touristUser2 = new User();
  touristUser2.email = "tourist2@example.com";
  touristUser2.password = await bcrypt.hash("password123", 10);
  touristUser2.firstName = "Bob";
  touristUser2.lastName = "Johnson";
  touristUser2.role = UserRole.TOURIST;
  await connection.manager.save(touristUser2);

  // Create employee profile
  const employee = new Employee();
  employee.user = employeeUser;
  employee.position = "Travel Consultant";
  employee.department = "Customer Service";
  employee.hireDate = new Date("2024-01-15");
  employee.employeeId = "EMP001";
  await connection.manager.save(employee);

  // Create tourist profiles
  const tourist1 = new Tourist();
  tourist1.user = touristUser1;
  tourist1.passportNumber = "AB123456";
  tourist1.nationality = "USA";
  tourist1.dateOfBirth = new Date("1990-05-15");
  tourist1.phoneNumber = "+1234567890";
  tourist1.address = "123 Main St, New York, USA";
  await connection.manager.save(tourist1);

  const tourist2 = new Tourist();
  tourist2.user = touristUser2;
  tourist2.passportNumber = "CD789012";
  tourist2.nationality = "UK";
  tourist2.dateOfBirth = new Date("1985-08-20");
  tourist2.phoneNumber = "+9876543210";
  tourist2.address = "456 High St, London, UK";
  await connection.manager.save(tourist2);

  // Create trips for tourists
  const trip1 = new Trip();
  trip1.name = "Bali Adventure";
  trip1.startDateTime = new Date("2025-06-01T08:00:00Z");
  trip1.endDateTime = new Date("2025-06-07T16:00:00Z");
  trip1.tripDestination = {
    city: "Bali",
    country: "Indonesia",
    coordinates: {
      latitude: -8.409518,
      longitude: 115.188919,
    },
    attractions: ["Beach", "Temple", "Rice Terraces"],
  };
  trip1.description =
    "A week-long adventure exploring the beautiful island of Bali";
  trip1.price = 1200.5;
  trip1.tourist = tourist1;
  await connection.manager.save(trip1);

  const trip2 = new Trip();
  trip2.name = "Tokyo Express";
  trip2.startDateTime = new Date("2025-07-15T10:00:00Z");
  trip2.endDateTime = new Date("2025-07-22T18:00:00Z");
  trip2.tripDestination = {
    city: "Tokyo",
    country: "Japan",
    coordinates: {
      latitude: 35.6762,
      longitude: 139.6503,
    },
    attractions: ["Shibuya", "Tokyo Tower", "Imperial Palace"],
  };
  trip2.description = "Experience the vibrant culture and technology of Tokyo";
  trip2.price = 1500.75;
  trip2.tourist = tourist1;
  await connection.manager.save(trip2);

  const trip3 = new Trip();
  trip3.name = "Paris Getaway";
  trip3.startDateTime = new Date("2025-08-10T09:00:00Z");
  trip3.endDateTime = new Date("2025-08-17T15:00:00Z");
  trip3.tripDestination = {
    city: "Paris",
    country: "France",
    coordinates: {
      latitude: 48.8566,
      longitude: 2.3522,
    },
    attractions: ["Eiffel Tower", "Louvre Museum", "Notre Dame"],
  };
  trip3.description = "Romantic week in the city of lights";
  trip3.price = 1800.25;
  trip3.tourist = tourist2;
  await connection.manager.save(trip3);

  // Create sentiment analysis entries
  const sentiment1 = new SentimentAnalysis();
  sentiment1.sentiment = SentimentType.POSITIVE;
  sentiment1.confidence = 0.92;
  sentiment1.rawAnalysis = { result: "POSITIVE", score: 0.92 };
  await connection.manager.save(sentiment1);

  const sentiment2 = new SentimentAnalysis();
  sentiment2.sentiment = SentimentType.NEUTRAL;
  sentiment2.confidence = 0.78;
  sentiment2.rawAnalysis = { result: "NEUTRAL", score: 0.78 };
  await connection.manager.save(sentiment2);

  const sentiment3 = new SentimentAnalysis();
  sentiment3.sentiment = SentimentType.NEGATIVE;
  sentiment3.confidence = 0.85;
  sentiment3.rawAnalysis = { result: "NEGATIVE", score: 0.85 };
  await connection.manager.save(sentiment3);

  // Create feedback entries
  const feedback1 = new Feedback();
  feedback1.rating = 5;
  feedback1.comment =
    "The Bali trip was amazing! The tour guide was very knowledgeable and friendly.";
  feedback1.trip = trip1;
  feedback1.tourist = tourist1;
  feedback1.sentimentAnalysis = sentiment1;
  await connection.manager.save(feedback1);

  const feedback2 = new Feedback();
  feedback2.rating = 3;
  feedback2.comment =
    "Tokyo trip was ok. Some activities were interesting but overall it was average.";
  feedback2.trip = trip2;
  feedback2.tourist = tourist1;
  feedback2.sentimentAnalysis = sentiment2;
  await connection.manager.save(feedback2);

  const feedback3 = new Feedback();
  feedback3.rating = 2;
  feedback3.comment =
    "Paris trip was disappointing. The hotel was not as advertised and the service was poor.";
  feedback3.trip = trip3;
  feedback3.tourist = tourist2;
  feedback3.sentimentAnalysis = sentiment3;
  await connection.manager.save(feedback3);

  console.log("Database seeded successfully!");
};
