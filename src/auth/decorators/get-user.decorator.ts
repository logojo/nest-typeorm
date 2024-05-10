import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";


//Este es un decorador personalizado
//Los decoradores interceptan la peticion y relizan una funcion previa a la peticion
export const GetUser = createParamDecorator(
    ( data, ctx : ExecutionContext ) => {
        const req = ctx.switchToHttp().getRequest(); //extrayendo el usuario de la request 
        const user = req.user;

        if( !user )
            throw new InternalServerErrorException('User not found (request)')

        return ( !data )
               ? user 
               : user[data];
    }
);

