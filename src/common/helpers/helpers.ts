import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";

@Injectable()
export class CommonHelpers {

    private readonly logger = new Logger('CommonHelpers');

    handleExceptions ( error : any ) : never {
        if( error.code === '23503' ) // error al eliminar registro relacionado
          throw new BadRequestException( error.detail )
        if( error.code === '23505' ) // error al insertar campo con indice existente
          throw new BadRequestException( error.detail )
    
        this.logger.error(error); // muestra los error de una manera resumida
        throw new InternalServerErrorException('Upss, something went wrong')
    }
}
