import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security
  app.use(helmet());
  
  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // API prefix
  const apiPrefix = process.env.API_PREFIX || 'api';
  app.setGlobalPrefix(apiPrefix);
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('DuuniJobs Candidates API')
    .setDescription('API for DuuniJobs Candidates Dashboard - CV upload, AI-powered improvements, job matching')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User profile management')
    .addTag('cv', 'CV upload and management')
    .addTag('ai', 'AI-powered tasks')
    .addTag('jobs', 'Job listings and matching')
    .addTag('applications', 'Job applications')
    .addTag('admin', 'Admin endpoints')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 DuuniJobs Candidates Backend running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();

