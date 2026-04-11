import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { BullModule } from '@nestjs/bull';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'document-processing',
        }),
    ],
    providers: [DocumentsService],
    controllers: [DocumentsController],
    exports: [DocumentsService],
})
export class DocumentsModule {}
