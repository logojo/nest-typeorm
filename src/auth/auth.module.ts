import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { CommonModule } from 'src/common/common.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports:[
    ConfigModule,
    TypeOrmModule.forFeature([
      User
    ]),
    PassportModule.register({ defaultStrategy:'jwt' }), // definiendo modulo y estrategiasde autenticación
    JwtModule.registerAsync({ // importando modulo de jwt de manera asincrona esto se hace asi encasode que las variables de entorno no este definina
      useFactory: () => {
        return {
          secret: process.env.JWT_SECRET,
          signOptions: { 
            expiresIn: '1h' 
          }
        }
      }
    }),
    CommonModule
  ],
  exports: [
    TypeOrmModule,
    JwtStrategy,
    PassportModule,
    JwtModule
  ]
})
export class AuthModule {}
