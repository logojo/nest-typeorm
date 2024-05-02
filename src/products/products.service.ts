import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { validate as isUUID } from 'uuid'

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { Product } from './entities/product.entity';
import { PaginationsDto } from 'src/common/dto/pagination.dto';

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


  //todo: paginar
  async findAll( paginationsDto : PaginationsDto ) {
    const { limit = 0, offset= 0} = paginationsDto;

    return await this.productRepository.find({
      take: limit,
      skip: offset,
      //todo: relasiones
    })


  }

  async findOne( term: string ) {
    let product : Product;

    if( isUUID( term ) )
        product = await this.productRepository.findOneBy({ id: term });
    else{
      const queryBuilder = await this.productRepository.createQueryBuilder();
      product = await queryBuilder.where('LOWER(title) =:title or slug =:slug',{
        title: term.toLowerCase(),
        slug: term.toLowerCase()
      }).getOne()
    }
    
    
    if( !product ) {
      throw new NotFoundException(`Product with id, title, slug "${ term }" not found `)
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
   try {

    const product = await this.productRepository.preload({
      id: id, 
      ...updateProductDto
    }); 

    if( !product ) throw new NotFoundException(`Product with id ${ id } not found` )
    
    await this.productRepository.save( product );

    return product
    
   } catch (error) {
    this.handleExceptions( error )
   }
  }

  async remove(id: string) {
    const product = await this.findOne( id );
    await this.productRepository.remove( product );  
  }


  private handleExceptions( error : any ) {
    if( error.code === '23505' )
      throw new BadRequestException( error.detail )

    this.logger.error(error); // muestra los error de una manera resumida
    throw new InternalServerErrorException('Upss, something went wrong')
  }
}
