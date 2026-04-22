import { Module } from '@nestjs/common'
import { AigcNormalService } from './aigc-normal.service'
import { AigcNormalController } from './aigc-normal.controller'

@Module({
    providers: [AigcNormalService],
    controllers: [AigcNormalController],
    exports: [AigcNormalService],
})
export class AigcNormalModule {}
