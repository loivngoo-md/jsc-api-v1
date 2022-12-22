import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SerializerInterceptor } from './helpers/serializer.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: { origin: '*' } });
  const port = process.env.PORT || 3000;

  app.setGlobalPrefix('/api/v1');

  app.useGlobalInterceptors(new SerializerInterceptor());

  app.useGlobalPipes(new ValidationPipe());

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, () => {
    console.log(`It works at http://127.0.0.1:${port}`);
  });
}
bootstrap();
