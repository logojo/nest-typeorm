import { Controller,  Post,  UseInterceptors, UploadedFile, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { diskStorage } from 'multer';
import { Response } from 'express';

import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';


@ApiTags('Files - get and upload')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService : ConfigService
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { 
    fileFilter: fileFilter,
    limits: { fileSize: 100000 }, 
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {

    if( !file ) {
      throw new BadRequestException(`There's no valid file`)
    }


    const secureUrl = `${this.configService.get('HOST_API')}/files/products/${file.filename}`;
      
    return {
      secureUrl
    };
  }

  @Get('upload/:fileName')
  findFile( 
    @Res() res: Response,
    @Param('fileName') fileName : string
  ){
  const path = this.filesService.getStaticFile( fileName )
  
  res.sendFile( path )
  }
}
