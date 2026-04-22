import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    UseGuards,
    Req,
    HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AigcNormalService } from './aigc-normal.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ResponseDto } from '@rag-ai/shared-types'

interface SendMessageDto {
    kbId: string
    content: string
    conversationId?: string
}

@ApiTags('aigc-normal')
@Controller('aigcChat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AigcNormalController {
    constructor(private readonly aigcNormalService: AigcNormalService) {}

    @Post('message')
    @ApiOperation({ summary: '发送消息并得到AI相应' })
    async sendMessage(@Body() body: SendMessageDto, @Req() req: any): Promise<ResponseDto<any>> {
        const data = await this.aigcNormalService.sendMessage(
            req.user.userId,
            body.content,
            body.conversationId,
        )
        return {
            code: HttpStatus.OK,
            message: '操作成功',
            result: data,
        }
    }

    @Get('conversations')
    @ApiOperation({ summary: '获取所有对话' })
    async getConversations(@Req() req: any): Promise<ResponseDto<any>> {
        const data = await this.aigcNormalService.getConversations(req.user.userId)
        return {
            code: HttpStatus.OK,
            message: '操作成功',
            result: data,
        }
    }

    @Get('conversations/messages/:conversationId')
    @ApiOperation({ summary: '获取会话中的消息' })
    async getMessages(
        @Param('conversationId') conversationId: string,
        @Req() req: any,
    ): Promise<ResponseDto<any>> {
        const data = await this.aigcNormalService.getMessages(conversationId, req.user.userId)
        return {
            code: HttpStatus.OK,
            message: '操作成功',
            result: data,
        }
    }

    @Delete('conversations/:conversationId')
    @ApiOperation({ summary: '删除会话' })
    async deleteConversation(
        @Param('conversationId') conversationId: string,
        @Req() req: any,
    ): Promise<ResponseDto<any>> {
        const data = await this.aigcNormalService.deleteConversation(
            conversationId,
            req.user.userId,
        )
        return {
            code: HttpStatus.OK,
            message: '操作成功',
            result: data,
        }
    }
}
