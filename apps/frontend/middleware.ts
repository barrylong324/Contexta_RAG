import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
    // 支持的语言列表
    locales,
    // 默认语言
    defaultLocale,
    // 始终显示语言前缀(可选,设为false则默认语言不显示前缀)
    localePrefix: 'as-needed',
});

export const config = {
    // 匹配所有路径,除了api、静态文件等
    matcher: ['/((?!api|_next|.*\\..*).*)'],
};
