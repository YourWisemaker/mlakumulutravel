import { createConnection } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { initialSeed } from "./seeds/initial-seed";

// Load environment variables
config();

const configService = new ConfigService();

async function runSeed() {
  const connection = await createConnection({
    type: "mysql",
    host: configService.get("DB_HOST"),
    port: +configService.get("DB_PORT"),
    username: configService.get("DB_USERNAME"),
    password: configService.get("DB_PASSWORD"),
    database: configService.get("DB_DATABASE"),
    entities: [__dirname + "/../**/*.entity{.ts,.js}"],
    synchronize: true,
  });

  try {
    await initialSeed(connection);
    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Error during seed:", error);
  } finally {
    await connection.close();
  }
}

runSeed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during seed execution:", error);
    process.exit(1);
  });
