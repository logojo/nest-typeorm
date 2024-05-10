import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { validate as isUUID } from 'uuid'

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { Product, ProductImage } from './entities';
import { PaginationsDto } from 'src/common/dto/pagination.dto';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { CommonHelpers } from 'src/common/helpers/helpers';
import { User } from 'src/auth/entities/user.entity';


@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository( Product )
    private readonly productRepository : Repository<Product>,

    @InjectRepository( ProductImage )
    private readonly productImageRepository : Repository<ProductImage>,

    private readonly dataSource : DataSource,
    private readonly helpers : CommonHelpers
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...rest } = createProductDto;

      const product =  this.productRepository.create({
        ...rest,
        user,
        images: images.map( image => this.productImageRepository.create({ url: image }))
      });

      await this.productRepository.save( product )

      return { ...product,  };

    } catch (error) {
      this.helpers.handleExceptions( error )
    }
  }


  async findAll( paginationsDto : IPaginationOptions ) {
    // const { limit = 0, offset= 0} = paginationsDto;

    // const products =  await this.productRepository.find({
    //   take: limit,
    //   skip: offset,      
    //   relations: {
    //     images: true,
    //   }
    // })

    // return products.map( ({ images, ...rest }) => ({
    //   ...rest,
    //   images : images.map(img => img.url)
    // }))

    const products = await this.productRepository.createQueryBuilder('products');
    
    products.leftJoinAndSelect('products.images', 'prodImages')
            .orderBy('products.id','DESC');
            
    return paginate<Product>(products, paginationsDto);
  }

  async findOne( term: string ) {
    let product : Product;

    if( isUUID( term ) )
        product = await this.productRepository.findOneBy({ id: term });
    else{
      const queryBuilder = await this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder.where('LOWER(title) =:title or slug =:slug',{
        title: term.toLowerCase(),
        slug: term.toLowerCase()
      })
      .leftJoinAndSelect('prod.images', 'prodImages') //leftJoinAndSelect se utiliza para mostrar los campos relacionados 
      .getOne()                                       // prod es el alias que se le asigna a la tabla y prod.images se refiere al campo relacionado      
    }                                                 //prodImages es un alias asignado en caso de querer hacer otro join con esas imagenes
    
    
    if( !product ) {
      throw new NotFoundException(`Product with id, title, slug "${ term }" not found `)
    }

    return product;
  }

  async findOnePlain( term : string ){
    const { images = [], ...rest} = await this.findOne( term );
    return {
      ...rest,
      images: images.map( image => image.url )
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
   
  
    const { images, ...toUpdate } = updateProductDto

    const product = await this.productRepository.preload({ id, ...toUpdate }); 

    if( !product ) throw new NotFoundException(`Product with id ${ id } not found` )

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction()


    try {   
      if( images ) {
        await queryRunner.manager.delete( ProductImage, { product: { id } })
        product.images = images.map( image => this.productImageRepository.create({ url: image }))
      } 

      await queryRunner.manager.save( product );
      await queryRunner.commitTransaction();
      await queryRunner.release();
     
      return this.findOnePlain( id )
      
    } catch (error) {      
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.helpers.handleExceptions( error )
    }
  }

  async remove(id: string) {
    const product = await this.findOne( id );
      
    try {
      await this.productRepository.remove( product );  
      return {
        status: 'ok'
      }
    } catch (error) {
      this.helpers.handleExceptions(error)
    }
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder()

    try {
      return await query.delete()
                        .where({})
                        .execute();
                        
    } catch (error) {
      this.helpers.handleExceptions( error )
    }
  }
}
