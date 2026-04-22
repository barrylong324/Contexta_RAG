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

#### 1. 克隆项目并安装依赖

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
