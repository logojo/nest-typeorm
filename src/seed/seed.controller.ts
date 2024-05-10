import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ValidRoles } from '../auth/interfaces';
import { SeedService } from './seed.service';
import { Auth } from '../auth/decorators';


@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  @Auth(ValidRoles.root)
  executeSeed() {
    return this.seedService.runSeed();
  }
}
