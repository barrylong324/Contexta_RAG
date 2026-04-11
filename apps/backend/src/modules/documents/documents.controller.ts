import { Controller, Get, Post, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('documents')
@Controller('knowledge-bases/:kbId/documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) {}

    @Get()
    @ApiOperation({ summary: 'Get all documents in a knowledge base' })
    async findAll(@Param('kbId') kbId: string, @Req() req: any): Promise<any[]> {
        return this.documentsService.findByKnowledgeBase(kbId, req.user.userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get document by ID' })
    async findOne(@Param('id') id: string, @Req() req: any): Promise<any> {
        return this.documentsService.findById(id, req.user.userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete document' })
    async delete(@Param('id') id: string, @Req() req: any) {
        await this.documentsService.delete(id, req.user.userId);
        return { success: true };
    }
}
