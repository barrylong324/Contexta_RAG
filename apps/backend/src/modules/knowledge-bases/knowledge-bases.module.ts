import { Module } from '@nestjs/common';
import { KnowledgeBasesService } from './knowledge-bases.service';
import { KnowledgeBasesController } from './knowledge-bases.controller';

@Module({
    providers: [KnowledgeBasesService],
    controllers: [KnowledgeBasesController],
    exports: [KnowledgeBasesService],
})
export class KnowledgeBasesModule {}
