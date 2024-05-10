import { Reflector } from '@nestjs/core';
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  
  constructor ( private readonly reflector : Reflector ) { } // con Reflector me ayuda a ver informacion de los decoradores y de la metadata
    
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

      const validRoles : string[] = this.reflector.get(META_ROLES, context.getHandler()) // roles es el arreglo enviado desde el controlador con el decorador @SetMetadata

      if( !validRoles ) return true // por que la autenticacion se esta haciendo en otro lugar 
      if( validRoles.length === 0 ) return true

      const req = context.switchToHttp().getRequest(); //extrayendo el usuario de la request 
      const user = req.user as User;

      if( !user )
           throw new BadRequestException('User not found')
      
      for( const role of user.roles ) {
         if( validRoles.includes( role ) )
             return true;
      }
    
    throw new ForbiddenException(`User ${ user.fullname } is not authorized`)
  }
}
