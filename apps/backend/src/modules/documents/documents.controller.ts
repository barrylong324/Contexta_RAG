import { Controller, Get, Post, Delete, Param, UseGuards, Req, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { DocumentsService } from './documents.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ResponseDto } from '@rag-ai/shared-types'

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) {}

    @Get('allDoc')
    @ApiOperation({ summary: 'Get all documents in a knowledge base' })
    async findAll(@Param('kbId') kbId: string, @Req() req: any): Promise<ResponseDto<any>> {
        const data = await this.documentsService.findByKnowledgeBase(kbId, req.user.userId)
        return {
            code: HttpStatus.OK,
            message: '操作成功',
            result: data,
        }
    }

    @Get('allDoc/:id')
    @ApiOperation({ summary: 'Get document by ID' })
    async findOne(@Param('id') id: string, @Req() req: any): Promise<ResponseDto<any>> {
        const data = await this.documentsService.findById(id, req.user.userId)
        return {
            code: HttpStatus.OK,
            message: '操作成功',
            result: data,
        }
    }

    @Delete('allDoc/:id')
    @ApiOperation({ summary: 'Delete document' })
    async delete(@Param('id') id: string, @Req() req: any): Promise<ResponseDto<any>> {
        const data = await this.documentsService.delete(id, req.user.userId)
        return {
            code: HttpStatus.OK,
            message: '操作成功',
            result: data,
        }
    }
}
