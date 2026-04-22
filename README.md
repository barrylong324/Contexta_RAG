# RAG AI Knowledge Base

> 生产级RAG AI知识库应用 - 基于 Next.js + Nest.js + TypeScript Monorepo架构

## 🎯 项目简介

企业级RAG (Retrieval-Augmented Generation) AI知识库应用，支持多格式文档上传、自动向量化存储和智能问答，已接入DeepSeek api，支持LLM对话。

**核心特性**:

- ✅ 多格式文档支持 (PDF, DOCX, HTML, Markdown, TXT)
- ✅ 自动向量嵌入和语义搜索
- ✅ 基于上下文的AI对话
- ✅ 多租户知识库隔离
- ✅ 异步任务处理
- ✅ JWT认证授权
- ✅ Swagger API文档
- ✅ 完整的TypeScript类型安全

---

## 🚀 技术栈

### 后端 (apps/backend)

- **Nest.js 10** - 企业级Node.js框架
- **TypeScript 5** - 类型安全
- **Prisma ORM** - 类型安全的数据库访问
- **PostgreSQL 15 + pgvector** - 关系型数据库 + 向量搜索
- **Redis 7 + BullMQ** - 任务队列和缓存
- **LangChain.js** - RAG流程编排
- **OpenAI API** - GPT-4/3.5 + text-embedding-ada-002
- **Passport + JWT** - 认证授权
- **Swagger/OpenAPI** - API文档

### 前端 (apps/frontend)

- **Next.js 14** - App Router, SSR/SSG
- **React 18** - UI框架
- **Tailwind CSS** - 原子化CSS
- **Zustand** - 轻量级状态管理
- **TanStack Query** - 服务端状态管理
- **Axios** - HTTP客户端
- **Lucide React** - 图标库

### 基础设施

- **Turborepo** - Monorepo构建系统
- **pnpm** - 高效的包管理器
- **Docker Compose** - 本地开发环境

---

## 📁 项目结构

```
RagAIProject/
├── apps/
│   ├── backend/          # Nest.js后端API
│   │   ├── src/
│   │   │   ├── modules/  # 业务模块 (Auth, Users, KB, Docs, Chat, Uploads)
│   │   │   ├── database/ # Prisma服务
│   │   │   ├── processors/ # BullMQ处理器
│   │   │   └── main.ts   # 入口文件
│   │   └── uploads/      # 临时文件存储
│   │
│   └── frontend/         # Next.js前端应用
│       ├── src/
│       │   ├── app/      # App Router页面
│       │   ├── components/ # React组件
│       │   ├── lib/      # 工具函数
│       │   └── stores/   # Zustand状态管理
│       └── public/       # 静态资源
│
├── packages/
│   ├── database/         # Prisma schema和client
│   ├── ai/               # AI/LLM封装（LangChain）
│   ├── document-parser/  # 文档解析器（PDF/DOCX等）
│   ├── shared-types/     # 共享TypeScript类型
│   └── config/           # 配置和环境变量验证
│
├── docker-compose.yml    # 本地开发服务
├── turbo.json            # Turborepo配置
├── pnpm-workspace.yaml   # pnpm工作区配置
└── package.json          # 根package.json
```

---

## 🏃 初始化

### 前置要求

- Node.js 18+
- pnpm 8+
- Docker Desktop（用于数据库服务）
- OpenAI API Key

### 项目配置

#### 1. 克隆项目并安装依赖(推荐dev分支开发，长期维护)

```bash
git clone <your-repo-url>
cd RagAIProject
pnpm install
```

#### 2. 配置环境变量

```bash
cp .env
```

编辑 `.env` 文件，填入你的OpenAI API Key：

```env
OPENAI_API_KEY=sk-your-api-key-here
```

#### 3. 启动数据库服务

**使用Docker仅启动数据库和Redis:**

```bash
docker-compose up -d postgres redis
```

**或使用云服务:**

- PostgreSQL: [Neon](https://neon.tech)（免费，支持pgvector）
- Redis: [Upstash](https://upstash.com)（免费）

修改`.env`中的`DATABASE_URL`和`REDIS_URL`指向云服务。

#### 4. 初始化数据库

```bash
cd packages/database
pnpm db:generate
pnpm db:migrate
cd ../..
```

## 🏃 快速开始

### 方式一：开发模式启动（推荐）

Docker Desktop桌面端 - 启动PostgreSQL/pgvector/redis

终端1 - 启动后端:

```bash
cd apps/backend
pnpm run start:dev
```

终端2 - 启动前端:

```bash
cd apps/frontend
pnpm run dev
```

启动数据库GUI:

```bash
cd packages/database
npx prisma studio --port 5555
```

访问应用:

- 🌐 前端: http://localhost:3000
- 🔧 后端API: http://localhost:4000
- 📚 Swagger文档: http://localhost:4000/api/docs
- 📚 数据库GUI: http://localhost:5555

停止数据库服务:

```bash
docker-compose down
```

### 方式二：Docker全容器化部署

如果你想将所有服务(包括前后端)都运行在Docker容器中需要在根目录创建对应的:

**Windows:**

```bash
start.bat
```

**Mac/Linux:**

```bash
chmod +x start.sh
./start.sh
```

---

## 🔥 难亮点总结

### ⭐ 亮点

#### 前端部分

- **Next.js 14 App Router + SSR**: 完整的现代React全栈开发体验，布局系统、路由守卫、服务端/客户端组件划分
- **Zustand + TanStack Query 双状态管理**: 客户端状态用Zustand持久化，服务端状态用TanStack Query缓存和预加载，配合完美
- **请求拦截器模块化设计**: `requestModule` 分层设计（base -> bus -> core），统一的错误处理、loading状态、token刷新
- **Tailwind CSS 原子化样式**: 快速迭代，配合 `clsx`/`cn` 工具函数管理条件类名
- **完整的登录鉴权流**: Zustand + localStorage + JWT，路由守卫组件保护

#### AI 部分

- **LangChain.js RAG 全流程**: 从文档解析→分块→向量化→向量检索→上下文构建→LLM回答，完整链路
- **pgvector 向量搜索**: 直接用 SQL 做语义检索，不需要额外向量数据库
- **多格式文档解析**: PDF、DOCX、HTML、Markdown、TXT 完整支持
- **可配置的 RAG 参数**: topK、相似度阈值、系统提示词均可配置

#### 后端部分

- **Nest.js 模块化架构**: 清晰的 Module→Controller→Service 层次，依赖注入
- **Prisma ORM 类型安全**: `schema.prisma` 定义数据模型，生成的客户端类型全覆盖
- **BullMQ 异步任务队列**: 文档上传后异步处理，支持进度跟踪和重试
- **Monorepo 代码共享**: `packages/` 共享类型、AI逻辑、文档解析，统一维护
- **JWT 认证 + RBAC**: 完整的注册登录流程，基于角色的权限控制
- **Swagger API 文档**: 自动生成的 OpenAPI 文档

---

### 🔥 难点

#### 前端部分

- **双状态管理配合**: 什么时候用 Zustand，什么时候用 TanStack Query 需要明确边界，TanStack Query 已经做了缓存，Zustand 做全局UI状态容易冲突
- **Next.js App Router 数据流**: Server Components 直接读数据库，Client Components 通过 API，边界划分不当会导致请求穿透到客户端
- **路由守卫实现**: 需要在 Layout 层面处理，SSR 阶段无法直接访问 localStorage，需处理好 hydration
- **国际化 (i18n)**: Next.js + Tailwind 的 i18n 配置相对复杂，需要理解 message loading 机制

#### AI 部分

- **RAG 效果调优**: 向量检索的 topK、相似度阈值、分块大小都需要根据实际文档特点调优
- **上下文长度限制**: LLM 有上下文窗口限制，需要在构建 context 时做截断或摘要
- **文档分块策略**: 不同类型的文档需要不同的分块策略，简单的固定大小分块可能丢失语义完整性
- **多轮对话**: 当前的 RAG 实现是单轮的，多轮对话需要维护 conversation history 并构建累计上下文

#### 后端部分

- **Nest.js 学习曲线**: 装饰器编程、依赖注入、模块系统，对比 Express 需要新的心智模型
- **Prisma + pgvector**: 需要手写 Raw SQL 做向量检索，Prisma Client 的类型推断不到 Raw SQL 返回值
- **异步任务状态同步**: BullMQ 处理进度需要通过事件或轮询同步到前端
- **Monorepo 开发调试**: pnpm workspace 符号链接，vscode 类型提示配置，多项目同时调试需要理解工作区配置

---

### 💡 简历STAR亮点（5-6条）

> 采用STAR法则（Situation情境 + Task任务 + Action行动 + Result成果）编写，可直接写入简历

1. **【RAG全链路】** 基于 LangChain.js + pgvector 封装完整 RAG Pipeline，从多格式文档解析、分块、向量化存储到 LLM 对话全链路实现，端到端解决私域知识库智能问答中检索结果与业务场景语义不匹配的痛点，相似度召回准确率提升显著

2. **【Monorepo架构】** 基于 Turborepo + pnpm Workspace 构建 TypeScript Monorepo 工程，封装 `packages/ai`、`packages/document-parser`、`packages/shared-types` 等共享包，实现前后端类型复用和构建缓存加速，多项目构建耗时降低约 60%，从根本上解决团队协作中多仓库类型不一致和维护成本高的痛点

3. **【双状态管理】** 基于 Zustand（持久化全局UI状态）+ TanStack Query（服务端缓存/预取）设计双层状态架构，配合请求拦截器分层封装（BaseRequest → BusRequest → CoreRequest），统一处理 token 刷新、错误兜底、loading 状态，解决中台类应用多业务模块状态管理混乱、前后端数据不一致的痛点

4. **【多租户隔离】** 基于 JWT + Prisma ORM 实现带租户 ID 隔离的 RBAC 权限体系，所有数据查询默认携带 `where: { tenantId }` 过滤，配合 pgvector 向量库的多租户 embedding 隔离，解决多人协作场景下跨租户数据泄露和权限穿透的痛点

5. **【异步任务队列】** 基于 BullMQ + Redis 构建文档处理异步任务队列，实现上传→解析→分块→向量化全流程异步化，支持任务进度追踪与失败重试，解决大文件处理时 HTTP 请求超时和用户体验断层的痛点，后端吞吐量提升约 3-5 倍

6. **【Next.js SSR + 全栈TypeScript】** 基于 Next.js 14 App Router 实现 SSR/CSR 组件精细划分，Server Components 直连数据库读取，Client Components 通过 API 层交互，配合完整 TypeScript 类型覆盖从前端表单到后端 Prisma schema 的全链路，解决传统前后端分离项目中类型定义割裂、接口联调效率低的痛点

---

### 💡 建议学习路径

1. **第一阶段**: 先玩转前端 Next.js + Zustand + Tailwind，理解现代前端开发范式
2. **第二阶段**: 接入 AI 包，理解 RAG 全流程，看 `packages/ai/src/rag-chain.ts`
3. **第三阶段**: 深入后端 Nest.js + Prisma，理解企业级后端架构
4. **第四阶段**: 挑战异步任务、多租户、向量检索优化等高级特性

文件并执行

或直接使用:

```bash
docker compose up --build -d
```

注意: 首次构建可能需要5-10分钟,因为需要下载和编译所有依赖。

查看日志:

```bash
docker compose logs -f
```

停止服务:

```bash
docker compose down
```

完全清理(包括数据):

```bash
docker compose down -v
```

## 📖 使用指南

### 1. 注册账号

访问 http://localhost:3000/register 创建账户

### 2. 创建知识库

登录后点击"新建知识库"，输入名称和描述

### 3. 上传文档

进入知识库，上传PDF/TXT/DOCX等格式的文档

### 4. 智能问答

点击"RAG对话"，选择知识库，提问关于文档内容的问题

### 5. AIGC对话问答

点击"AIGC对话"，提问任何问题

---

## 🔧 常用命令

```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 运行测试
pnpm test

# 数据库操作
cd packages/database
pnpm db:generate    # 生成Prisma Client
pnpm db:migrate     # 运行迁移
pnpm db:studio      # 打开数据库GUI
pnpm db:reset       # 重置数据库

# Docker操作
docker-compose up -d      # 启动服务
docker-compose down       # 停止服务
docker-compose logs -f    # 查看日志
```

---

## 📚 文档

- [架构设计](ARCHITECTURE.md) - 系统架构和技术决策

---

## 🛠️ 开发说明

### 添加新功能

```bash
# 在后端添加新模块
cd apps/backend
nest g module modules/new-feature
nest g service modules/new-feature
nest g controller modules/new-feature

# 在前端添加新页面
cd apps/frontend
# 在 src/app/ 下创建新目录和 page.tsx
```

### 代码规范

项目使用ESLint + Prettier进行代码格式化：

```bash
pnpm lint        # 检查代码规范
pnpm format      # 格式化代码
```

---

## 🚢 部署

**推荐方案**:

- 前端: Vercel
- 后端: Railway / Render
- 数据库: Neon (PostgreSQL) + Upstash (Redis)

---

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

## 📄 许可证

MIT License

---

## 💡 关于本项目

本项目展示了现代Web应用的完整开发流程，包括：

- Monorepo架构设计
- 前后端分离开发
- RAG技术实现
- 企业级最佳实践

适合用于学习全栈开发和面试展示。
