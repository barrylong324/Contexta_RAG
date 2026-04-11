# 国际化 (i18n) 使用指南

本项目使用 `next-intl` 实现中英文国际化支持。

## 📁 文件结构

```
apps/frontend/
├── messages/              # 翻译文件
│   ├── en.json           # 英文翻译
│   └── zh.json           # 中文翻译
├── i18n.ts               # i18n 配置
├── middleware.ts         # 语言路由中间件
└── src/
    └── components/
        └── layout/
            └── language-switcher.tsx  # 语言切换组件
```

## 🌍 支持的语言

- 🇺🇸 English (`en`)
- 🇨🇳 中文 (`zh`)

默认语言：**中文**

## 🚀 使用方法

### 1. 在组件中使用翻译

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function MyComponent() {
    const t = useTranslations('settings');

    return (
        <div>
            <h1>{t('title')}</h1>
            <p>{t('description')}</p>
        </div>
    );
}
```

### 2. 添加新的翻译文本

在 `messages/en.json` 和 `messages/zh.json` 中添加对应的键值对：

```json
// messages/en.json
{
    "mySection": {
        "title": "My Title",
        "description": "My Description"
    }
}

// messages/zh.json
{
    "mySection": {
        "title": "我的标题",
        "description": "我的描述"
    }
}
```

### 3. 嵌套翻译

支持点号访问嵌套对象：

```tsx
const t = useTranslations('settings.profile');
t('name'); // 访问 settings.profile.name
```

### 4. 带参数的翻译

```json
{
    "greeting": "Hello, {name}!"
}
```

```tsx
const t = useTranslations('common');
t('greeting', { name: 'John' }); // "Hello, John!"
```

## 🔄 语言切换

项目中已集成语言切换组件 `<LanguageSwitcher />`，位于导航栏右上角。

用户点击后可以切换中英文，URL会自动更新为：
- `/en/dashboard/settings` (英文)
- `/zh/dashboard/settings` (中文)

## 📝 翻译文件结构

翻译文件按功能模块组织：

- `common` - 通用文本（按钮、状态等）
- `navigation` - 导航菜单
- `auth` - 认证相关（登录、注册）
- `settings` - 设置页面
- `dashboard` - 仪表板
- `knowledgeBases` - 知识库
- `chat` - 聊天功能
- `upload` - 上传功能

## ⚙️ 配置说明

### i18n.ts

```typescript
export const locales = ['en', 'zh'];
export const defaultLocale = 'zh'; // 默认语言
```

### middleware.ts

自动处理语言路由，匹配所有非API和非静态文件的路径。

## 💡 最佳实践

1. **始终使用翻译hook**：不要在代码中硬编码文本
2. **保持翻译文件同步**：添加新文本时同时更新en.json和zh.json
3. **使用有意义的键名**：如 `settings.profile.name` 而非 `s.p.n`
4. **模块化组织**：按功能模块分组翻译文本
5. **测试两种语言**：确保切换语言后所有文本正确显示

## 🔧 常见问题

### Q: 如何获取当前语言？

```tsx
import { useLocale } from 'next-intl';

const locale = useLocale(); // 'en' or 'zh'
```

### Q: 如何在服务端组件中使用？

```tsx
import { getTranslations } from 'next-intl/server';

export default async function ServerComponent() {
    const t = await getTranslations('settings');
    return <h1>{t('title')}</h1>;
}
```

### Q: 如何添加新语言？

1. 在 `i18n.ts` 中添加新语言代码
2. 创建对应的翻译文件（如 `messages/ja.json`）
3. 在 `LanguageSwitcher` 组件中添加选项

## 📚 更多资源

- [next-intl 官方文档](https://next-intl-docs.vercel.app/)
- [Next.js i18n 路由](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
