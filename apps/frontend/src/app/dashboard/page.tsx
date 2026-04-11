'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { BookOpen, FileText, MessageSquare, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';

interface Stats {
    knowledgeBases: number;
    documents: number;
    conversations: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({
        knowledgeBases: 0,
        documents: 0,
        conversations: 0,
    });
    const [loading, setLoading] = useState(true);
    const t = useTranslations('dashboard');

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [kbRes, docRes, convRes] = await Promise.all([
                apiClient.get('/knowledge-bases'),
                apiClient.get('/documents'),
                apiClient.get('/conversations'),
            ]);

            setStats({
                knowledgeBases: kbRes.data.length || 0,
                documents: docRes.data.length || 0,
                conversations: convRes.data.length || 0,
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: t('stats.totalKBs'),
            value: stats.knowledgeBases,
            icon: BookOpen,
            color: 'bg-black',
        },
        {
            title: t('stats.totalDocuments'),
            value: stats.documents,
            icon: FileText,
            color: 'bg-gray-700',
        },
        {
            title: t('stats.totalChats'),
            value: stats.conversations,
            icon: MessageSquare,
            color: 'bg-gray-800',
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-black">{t('title')}</h1>
                <p className="mt-1 text-sm text-gray-600">{t('welcome')}</p>
                <p className="mt-2 text-gray-600">Manage your knowledge bases and chat with AI</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title}>
                            <CardContent className="p-5">
                                <div className="flex items-center">
                                    <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                {stat.title}
                                            </dt>
                                            <dd className="text-3xl font-semibold text-gray-900">
                                                {stat.value}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-black mb-4">Quick Start</h3>
                    <div className="space-y-3">
                        <div className="flex items-start">
                            <TrendingUp className="h-5 w-5 text-black mt-0.5 mr-3" />
                            <div>
                                <p className="text-sm text-gray-700">
                                    <strong>Create a Knowledge Base:</strong> Start by creating your
                                    first knowledge base to organize your documents.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <TrendingUp className="h-5 w-5 text-black mt-0.5 mr-3" />
                            <div>
                                <p className="text-sm text-gray-700">
                                    <strong>Upload Documents:</strong> Upload PDF, DOCX, or text files
                                    to build your knowledge base.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <TrendingUp className="h-5 w-5 text-black mt-0.5 mr-3" />
                            <div>
                                <p className="text-sm text-gray-700">
                                    <strong>Start Chatting:</strong> Ask questions and get AI-powered
                                    answers based on your documents.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
