import { Module } from '@nestjs/common';

import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports:[
    TypeOrmModule.forFeature([
      Product,
      ProductImage
    ]),
    AuthModule,
    CommonModule
  ],
  exports: [ProductsService, TypeOrmModule] //se exporta el TypeOrmModule para poder utilizar las tablas en otros modulos
})
export class ProductsModule {}
