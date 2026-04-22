import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { executeRAGChain, askDeepSeek } from '@rag-ai/ai';
import { Conversation, Message } from '@rag-ai/database';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}

    async sendMessage(
        userId: string,
        knowledgeBaseId: string,
        content: string,
        conversationId?: string,
    ) {
        let conversation: Conversation | null;

        // Find or create conversation
        if (conversationId) {
            conversation = await this.prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    knowledgeBaseId,
                    deletedAt: null,
                },
            });

            if (!conversation) {
                throw new NotFoundException('Conversation not found');
            }
        } else {
            conversation = await this.prisma.conversation.create({
                data: {
                    title: content.substring(0, 100),
                    knowledgeBaseId,
                    userId,
                },
            });
        }

        // Save user message
        await this.prisma.message.create({
            data: {
                content,
                role: 'USER',
                conversationId: conversation.id,
            },
        });

        // Get conversation history
        const messages = await this.prisma.message.findMany({
            where: { conversationId: conversation.id },
            orderBy: { createdAt: 'asc' },
            take: 20, // Last 20 messages for context
        });

        const conversationHistory = messages.map((msg) => ({
            role: msg.role.toLowerCase(),
            content: msg.content,
        }));

        // Execute RAG chain
        // const result = await executeRAGChain({
        //     query: content,
        //     knowledgeBaseId,
        //     topK: 5,
        //     conversationHistory,
        // });
        // 暂时不调用rag了，用通用大模型测试

        const answer = await askDeepSeek(content);
        return {
            messageId: '',
            answer,
            sources: '',
            conversationId: '',
        };
        // const result = await executeRAGChain({
        //     query: content,
        //     knowledgeBaseId,
        //     topK: 5,
        //     conversationHistory,
        // });
        // // Save AI response
        // const aiMessage = await this.prisma.message.create({
        //     data: {
        //         // content: result.answer,
        //         content: result.answer,
        //         role: 'ASSISTANT',
        //         conversationId: conversation.id,
        //         sources: result.sources as any,
        //     },
        // });

        // return {
        //     messageId: aiMessage.id,
        //     answer: result.answer,
        //     sources: result.sources,
        //     conversationId: conversation.id,
        // };
    }

    async getConversations(userId: string, knowledgeBaseId: string) {
        return this.prisma.conversation.findMany({
            where: {
                userId,
                knowledgeBaseId,
                deletedAt: null,
            },
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: {
                    select: { messages: true },
                },
            },
        });
    }

    async getMessages(conversationId: string, userId: string): Promise<any[]> {
        const conversation = await this.prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId,
            },
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        return this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
        });
    }

    async deleteConversation(conversationId: string, userId: string) {
        const conversation = await this.prisma.conversation.findFirst({
            where: { id: conversationId, userId },
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { deletedAt: new Date() },
        });
    }
}
