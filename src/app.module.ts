import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type             : 'postgres',
      host             : process.env.DB_HOST,
      port             : +process.env.DB_PORT,
      database         : process.env.DB_NAME,
      username         : process.env.DB_USERNAME,
      password         : process.env.DB_PASSWORD,
      autoLoadEntities : true, // Carga automaticamente las entidades
      synchronize      : true // cuando se genera un cambio en las entidades automaticamente las sincroniza con la db
    }),
    ProductsModule
  ],
})
export class AppModule {}