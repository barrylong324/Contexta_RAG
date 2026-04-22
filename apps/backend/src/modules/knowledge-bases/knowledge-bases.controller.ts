import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Req,
    Logger,
    HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { KnowledgeBasesService } from './knowledge-bases.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateKnowledgeBaseInput, UpdateKnowledgeBaseInput } from '@rag-ai/shared-types'
import { ResponseDto } from '@rag-ai/shared-types'

@ApiTags('knowledge-bases')
@Controller('knowledgeBases')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KnowledgeBasesController {
    private readonly logger = new Logger(KnowledgeBasesController.name)

    constructor(private readonly kbService: KnowledgeBasesService) {}

    @Get('getAllKnowledgeBases')
    @ApiOperation({ summary: 'Get all knowledge bases for current user' })
    async findAll(@Req() req: any): Promise<ResponseDto<any>> {
        const data = await this.kbService.findAll(req.user.userId)
        return {
            code: HttpStatus.OK,
            message: '操作成功',
            result: data,
        }
    }

    @Get('getAllKnowledgeBases/:id')
    @ApiOperation({ summary: 'Get knowledge base by ID' })
    async findOne(@Param('id') id: string, @Req() req: any): Promise<ResponseDto<any>> {
        const data = await this.kbService.findById(id, req.user.userId)
        return {
            code: HttpStatus.OK,
            message: '操作成功',
            result: data,
        }
    }

    @Post('addKnowledgeBases')
    @ApiOperation({ summary: 'Create knowledge base' })
    async create(
        @Body() body: CreateKnowledgeBaseInput,
        @Req() req: any,
    ): Promise<ResponseDto<any>> {
        const data = await this.kbService.create(req.user.userId, body as CreateKnowledgeBaseInput)
        return {
            code: HttpStatus.OK,
            message: '操作成功',
            result: data,
        }
    }

    @Post('updateKnowledgeBases')
    @ApiOperation({ summary: 'Update knowledge base' })
    async update(
        @Body() body: UpdateKnowledgeBaseInput,
        @Req() req: any,
    ): Promise<ResponseDto<any>> {
        const data = await this.kbService.update(req.user.userId, body)
        return {
            code: HttpStatus.OK,
            message: '操作成功',
            result: data,
        }
    }

    @Delete('delKnowledgeBases/:id')
    @ApiOperation({ summary: 'Delete knowledge base' })
    async delete(@Param('id') id: string, @Req() req: any): Promise<ResponseDto<any>> {
        const data = await this.kbService.delete(id, req.user.userId)
        return {
            code: HttpStatus.OK,
            message: '操作成功',
            result: data,
        }
    }
}
