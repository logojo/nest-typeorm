import { Controller, Post, Body, Get, UseGuards,  } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { Auth, GetUser, Rawheaders } from './decorators';
import { UserRoleGuard } from './guards/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('refresh')
  @ApiBearerAuth()
  @Auth()
  refresh(@GetUser() user : User) {
    return this.authService.refresh( user );
  }

  @Get('me')
  @UseGuards( AuthGuard() ) //configurando ruta protegida
  me( 
    @GetUser() user : User,
    @GetUser('email') userEmail : string,
    @Rawheaders() headers : string[]
  ) { // @GetUser() y Rawheaders() /* son decoradores personalizado con los que obtengo el usuario logueado y los headers
    
   return {
     ok: true,
     user,
     userEmail,
     headers
   }
  }



  //@SetMetadata('roles', ['admin', 'root']) // @SetMetadata decorador utilizado para enviar los roles al guard UserRoleGuard

  //ruta protegida y configurara para aceptar roles
  @Get('private')
  @RoleProtected(ValidRoles.root, ValidRoles.admin)
  @UseGuards( AuthGuard(), UserRoleGuard )
  private(
    @GetUser() user : User,
  ){
    return {
      ok: true,
      user
    }
  }

   //ruta protegida y configurara utilizando Decorator composition
  @Get('private2')
  @Auth(ValidRoles.root, ValidRoles.admin)
  private2(
    @GetUser() user : User,
  ){
    return {
      ok: true,
      user
    }
  }

  
}
