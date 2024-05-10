import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'

import { User } from './entities/user.entity';
import { CommonHelpers } from 'src/common/helpers/helpers';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
 
  constructor( 
    @InjectRepository(User)
    private readonly userRepository : Repository<User>,
    private readonly helpers : CommonHelpers,
    private readonly jwtService : JwtService
  ) { }


  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user  =  this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync( password, 10)
      });

      await this.userRepository.save( user )
      delete user.password 
      delete user.isActive 

      return {
         ...user,
         token: this.getJwtToken({ id: user.id, email: user.email })
      };
    } catch ( error ) {
      this.helpers.handleExceptions( error )
    }
  }

  async login( loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
  
    const user = await this.userRepository.findOne({ 
      where : { email },
      select: { id: true, fullname: true, email: true, password: true, roles: true }
    });

    if( !user )
        throw new UnauthorizedException('User or password are incorrect')

    if( !bcrypt.compareSync(password, user.password) )
        throw new UnauthorizedException('User or password are incorrect')

    delete user.password 

    return {
      ...user,
      token: this.getJwtToken({ id: user.id, email: user.email })
    };
  }

  refresh( user : User ) {
    return {
      user,
      token: this.getJwtToken({ id: user.id, email: user.email })
    };
  }

  private getJwtToken( payload: JwtPayload) {
    const token = this.jwtService.sign( payload );
    return token;
  }

  
}
