import { Module } from '@nestjs/common';
import { CommonHelpers } from './helpers/helpers';

@Module({
    providers: [CommonHelpers],
    exports:[ CommonHelpers ]
})
export class CommonModule {}
