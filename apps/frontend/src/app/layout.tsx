import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import IntlProvider from '@/components/providers/intl-provider';
import { locales, defaultLocale, type Locale } from '../../i18n';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'RAG AI Knowledge Base',
    description: 'Intelligent knowledge base powered by RAG and AI',
};

export function generateStaticParams() {
    return locales.map((locale: Locale) => ({ locale }));
}

export default function RootLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: { locale: string };
}>) {
    const locale = params.locale || defaultLocale;

    return (
        <html lang={locale}>
            <body className={inter.className}>
                <IntlProvider>
                    <Providers>{children}</Providers>
                </IntlProvider>
            </body>
        </html>
    );
}
