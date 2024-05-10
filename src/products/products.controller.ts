import { Controller, Get, Post, Body, Param, Delete, ParseUUIDPipe, Query, Put, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { IPaginationOptions } from 'nestjs-typeorm-paginate';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationsDto } from 'src/common/dto/pagination.dto'; // paginacion anterior
import { Auth, GetUser } from '../auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/user.entity';
import { Product } from './entities';

@ApiTags('Products') // decorador del paquete de documentacón
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth( ValidRoles.root )
  @ApiResponse({ status: 201, description: 'product was created successfully', type: Product}) // decorador de documentación
  @ApiResponse({ status: 400, description: 'BadRequest'})
  @ApiResponse({ status: 403, description: 'Forbidden , token related'})
  @ApiBearerAuth('JWT-auth')
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user : User
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  @Auth()
  @ApiQuery({ name: 'page', example: 1, required: false, description: 'What page do you want to see',   })// documentacion
  @ApiQuery({ name: 'limit', example: 10, required: false, description: 'How many rows do you want to see' })
  findAll( 
    @Query('page', new DefaultValuePipe(1), ParseIntPipe ) page : number = 1, 
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe ) limit : number = 1, 
  ) {
    const paginationsDto : IPaginationOptions = {
      limit,
      page,
      route: 'http://localhost:3000/api/products',
    }

    return this.productsService.findAll( paginationsDto );
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string) {
    return this.productsService.findOnePlain(term);
  }

  @Put(':id')
  @Auth( ValidRoles.root )
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Auth( ValidRoles.root )
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove( id );
  }
}
