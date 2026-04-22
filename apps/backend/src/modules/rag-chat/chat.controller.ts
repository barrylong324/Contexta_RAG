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
import { ChatService } from './chat.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ResponseDto, SendMessageDto } from '@rag-ai/shared-types'

@ApiTags('chat')
@Controller('ragChat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post('message')
    @ApiOperation({ summary: '发送消息并得到AI相应' })
    async sendMessage(@Body() body: SendMessageDto, @Req() req: any): Promise<ResponseDto<any>> {
        const data = await this.chatService.sendMessage(
            req.user.userId,
            body.kbId,
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
    @ApiOperation({ summary: '根据知识库id获取所有对话' })
    async getConversations(
        @Param('kbId') kbId: string,
        @Req() req: any,
    ): Promise<ResponseDto<any>> {
        const data = await this.chatService.getConversations(req.user.userId, kbId)
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
        const data = await this.chatService.getMessages(conversationId, req.user.userId)
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
        const data = await this.chatService.deleteConversation(conversationId, req.user.userId)
        return {
            code: HttpStatus.OK,
            message: '操作成功',
            result: data,
        }
    }
}
