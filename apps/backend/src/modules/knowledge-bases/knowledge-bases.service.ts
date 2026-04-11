import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { KnowledgeBase } from '@rag-ai/database';
import { CreateKnowledgeBaseInput, UpdateKnowledgeBaseInput } from '@rag-ai/shared-types';

@Injectable()
export class KnowledgeBasesService {
    private readonly logger = new Logger(KnowledgeBasesService.name);

    constructor(private prisma: PrismaService) {}

    async findAll(userId: string): Promise<KnowledgeBase[]> {
        return this.prisma.knowledgeBase.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    {
                        collaborations: {
                            some: { userId },
                        },
                    },
                ],
                deletedAt: null,
            },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { documents: true },
                },
            },
        });
    }

    async findById(id: string, userId: string): Promise<KnowledgeBase> {
        const kb = await this.prisma.knowledgeBase.findFirst({
            where: {
                id,
                deletedAt: null,
                OR: [
                    { ownerId: userId },
                    {
                        collaborations: {
                            some: { userId },
                        },
                    },
                ],
            },
            include: {
                owner: {
                    select: { id: true, email: true, name: true },
                },
                _count: {
                    select: { documents: true },
                },
            },
        });

        if (!kb) {
            throw new NotFoundException(`Knowledge base with ID ${id} not found`);
        }

        return kb;
    }

    async create(userId: string, data: CreateKnowledgeBaseInput): Promise<KnowledgeBase> {
        this.logger.debug(`Creating KB with data: ${JSON.stringify(data)}`);

        const result = await this.prisma.knowledgeBase.create({
            data: {
                name: data.name,
                description: data.description,
                icon: data.icon,
                isPublic: data.isPublic || false,
                ownerId: userId,
            },
        });

        this.logger.log(`Successfully created KB: ${result.id}`);
        return result;
    }

    async update(
        // id: string,
        userId: string,
        data: UpdateKnowledgeBaseInput,
    ): Promise<KnowledgeBase> {
        // Check ownership
        const kb = await this.prisma.knowledgeBase.findFirst({
            where: { id: data.id, ownerId: userId },
        });

        if (!kb) {
            throw new ForbiddenException(
                'You do not have permission to update this knowledge base',
            );
        }

        return this.prisma.knowledgeBase.update({
            where: { id: data.id },
            data,
        });
    }

    async delete(id: string, userId: string): Promise<void> {
        // Check ownership
        const kb = await this.prisma.knowledgeBase.findFirst({
            where: { id, ownerId: userId },
        });

        if (!kb) {
            throw new ForbiddenException(
                'You do not have permission to delete this knowledge base',
            );
        }

        // Soft delete
        await this.prisma.knowledgeBase.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
