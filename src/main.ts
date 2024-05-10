import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api')
  
  app.useGlobalPipes( 
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Codigo para generar la documentacion
  const config = new DocumentBuilder()
      .setTitle('Telos RESTFul API')
      .setDescription('Teslo shop endpoinds')
      .setVersion('1.0') 
      .addServer('http://localhost:3000/')    
      .addBearerAuth({
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth'
      ) 
      .addSecurityRequirements('bearer')
      .build();
      
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, );

    // end documentacion

  await app.listen(process.env.PORT);
}
bootstrap();
