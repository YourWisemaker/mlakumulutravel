import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';

// Create Express instance for serverless adapter
export const expressApp = express();
const adapter = new ExpressAdapter(expressApp);

// Bootstrap the Nest application
async function bootstrap() {
  const app = await NestFactory.create(AppModule, adapter);
  
  // Enable CORS for all routes
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // API prefix
  app.setGlobalPrefix('api');
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Mlaku-Mulu Travel API')
    .setDescription('REST API for the Mlaku-Mulu Travel Agency')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Initialize the application
  await app.init();
  
  return app;
}

// Export the bootstrap function for serverless
export const handler = bootstrap();
