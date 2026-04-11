import { getRequestConfig } from 'next-intl/server';

// 支持的语言列表
export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];

// 默认语言
export const defaultLocale: Locale = 'zh';

export default getRequestConfig(async ({ locale }) => {
    // 如果locale无效,使用默认语言
    const validLocale = locale && locales.includes(locale as Locale) ? locale : defaultLocale;

    return {
        locale: validLocale,
        messages: (await import(`./messages/${validLocale}.json`)).default,
    };
});
