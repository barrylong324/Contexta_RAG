import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { askDeepSeek } from '@rag-ai/ai'
import { AigcConversation } from '@rag-ai/database'

@Injectable()
export class AigcNormalService {
    constructor(private prisma: PrismaService) {}

    async sendMessage(userId: string, content: string, conversationId?: string) {
        let aigcConversation: AigcConversation | null

        // Find or create aigcConversation
        if (conversationId) {
            aigcConversation = await this.prisma.aigcConversation.findFirst({
                where: {
                    id: conversationId,
                    deletedAt: null,
                },
            })

            if (!aigcConversation) {
                throw new NotFoundException('Conversation not found')
            }
        } else {
            aigcConversation = await this.prisma.aigcConversation.create({
                data: {
                    title: content.substring(0, 100),
                    userId,
                },
            })
        }

        // Save user message
        const userMessage = await this.prisma.aigcMessage.create({
            data: {
                content,
                role: 'USER',
                conversationId: aigcConversation.id,
            },
        })

        const answer = await askDeepSeek(content)
        return {
            messageId: userMessage.id,
            answer,
            sources: '',
            conversationId: aigcConversation.id,
        }
    }

    async getConversations(userId: string) {
        return this.prisma.aigcConversation.findMany({
            where: {
                userId,
                deletedAt: null,
            },
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: {
                    select: { messages: true },
                },
            },
        })
    }

    async getMessages(conversationId: string, userId: string): Promise<any[]> {
        const aigcConversation = await this.prisma.aigcConversation.findFirst({
            where: {
                id: conversationId,
                userId,
            },
        })

        if (!aigcConversation) {
            throw new NotFoundException('Conversation not found')
        }

        return this.prisma.aigcMessage.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
        })
    }

    async deleteConversation(conversationId: string, userId: string) {
        const aigcConversation = await this.prisma.aigcConversation.findFirst({
            where: { id: conversationId, userId },
        })

        if (!aigcConversation) {
            throw new NotFoundException('Conversation not found')
        }

        await this.prisma.aigcConversation.update({
            where: { id: conversationId },
            data: { deletedAt: new Date() },
        })
    }
}
