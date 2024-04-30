import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository( Product )
    private readonly productRepository : Repository<Product>
  ) {}


  async create(createProductDto: CreateProductDto) {
    try {
      const product =  this.productRepository.create(createProductDto);
      await this.productRepository.save( product )

      return product;

    } catch (error) {
      this.handleExceptions( error )
    }
  }

  async findAll() {
    return await this.productRepository.find()
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOneBy({ id: id });
    
    if( !product ) {
      throw new NotFoundException(`Product with id, "${ id }" not found `)
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product =  await this.productRepository.update(id, {...updateProductDto}); 
    
    //Todo: regresar todo el registro
    return updateProductDto;
  }

  async remove(id: string) {
    const { affected } = await this.productRepository.delete({ id: id })

    if( affected == 0 )
        throw new NotFoundException(`Product with id, "${ id }" not found `)
  }


  private handleExceptions( error : any ) {
    if( error.code === '23505' )
      throw new BadRequestException( error.detail )

    this.logger.error(error); // muestra los error de una manera resumida
    throw new InternalServerErrorException('Upss, something went wrong')
  }
}
