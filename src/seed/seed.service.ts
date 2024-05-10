import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class SeedService {

  constructor( 
    private readonly productsService : ProductsService,
    @InjectRepository(User)
    private readonly userRepository :  Repository<User> 
  )  {}

  async runSeed() {
    await this.deleteTables()
    const user = await this.insertUsers()
    await this.insertProducts( user );
    return 'execute seed'
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertUsers() {
    const data = initialData.users;

    const users : User[] = []

    data.forEach( user => {
      users.push( this.userRepository.create( user ) )
    })

    await this.userRepository.save( users );

    return users[0];
  }

  private async insertProducts( user : User) {

    const products = initialData.products;

    const insertPromises = []

    products.forEach( product => {
      insertPromises.push( this.productsService.create( product, user ) )
    })

    await Promise.all( insertPromises )

  }
}
