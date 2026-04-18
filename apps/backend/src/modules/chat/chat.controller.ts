import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface SendMessageDto {
    kbId: string;
    content: string;
    conversationId?: string;
}

@ApiTags('chat')
@Controller('knowledge-bases/chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post('message')
    @ApiOperation({ summary: 'Send a message and get AI response' })
    async sendMessage(@Body() body: SendMessageDto, @Req() req: any) {
        return this.chatService.sendMessage(
            req.user.userId,
            body.kbId,
            body.content,
            body.conversationId,
        );
    }

    @Get('conversations')
    @ApiOperation({ summary: 'Get all conversations' })
    async getConversations(@Param('kbId') kbId: string, @Req() req: any) {
        return this.chatService.getConversations(req.user.userId, kbId);
    }

    @Get('conversations/:conversationId/messages')
    @ApiOperation({ summary: 'Get messages in a conversation' })
    async getMessages(
        @Param('conversationId') conversationId: string,
        @Req() req: any,
    ): Promise<any[]> {
        return this.chatService.getMessages(conversationId, req.user.userId);
    }

    @Delete('conversations/:conversationId')
    @ApiOperation({ summary: 'Delete a conversation' })
    async deleteConversation(@Param('conversationId') conversationId: string, @Req() req: any) {
        await this.chatService.deleteConversation(conversationId, req.user.userId);
        return { success: true };
    }
}
