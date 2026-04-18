'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, MessageSquare, Upload, Settings, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Sidebar() {
    const pathname = usePathname();
    const t = useTranslations('navigation');

    const navigation = [
        { name: t('dashboard'), href: '/dashboard', icon: Home },
        { name: t('knowledgeBases'), href: '/dashboard/knowledge-bases', icon: BookOpen },
        { name: t('chat'), href: '/dashboard/chat', icon: MessageSquare },
        { name: t('upload'), href: '/dashboard/upload', icon: Upload },
        { name: t('settings'), href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
                <div className="flex flex-col h-0 flex-1 bg-black">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4">
                            <h1 className="text-white text-xl font-bold">Contexta RAG</h1>
                            {/* <h1 className="text-white text-xl font-bold">袁总的RAG</h1> */}
                        </div>
                        <nav className="mt-5 flex-1 px-2 space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                                            ? 'bg-gray-800 text-white'
                                            : 'text-gray-300 hover:bg-gray-900'
                                            }`}
                                    >
                                        <Icon
                                            className={`mr-3 flex-shrink-0 h-6 w-6 ${isActive ? 'text-white' : 'text-gray-400'
                                                }`}
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}
