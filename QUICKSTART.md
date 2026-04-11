# 快速启动指南

## 🚀 5分钟快速开始

### 前置条件

确保已安装：

- ✅ Node.js >= 18.0.0 ([下载](https://nodejs.org/))
- ✅ pnpm >= 8.0.0 (`npm install -g pnpm`)
- ✅ Docker Desktop ([下载](https://www.docker.com/products/docker-desktop/))

### 步骤1: 安装依赖

```bash
pnpm install
```

### 步骤2: 配置环境变量

复制示例配置文件并编辑：

```bash
cp .env.example .env
```

**必须配置的变量：**

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
NEXTAUTH_SECRET=your-super-secret-key-at-least-32-characters
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rag_ai_db
REDIS_URL=redis://localhost:6379
```

获取OpenAI API Key: https://platform.openai.com/api-keys

### 步骤3: 启动基础设施

```bash
docker-compose up -d
```

这将启动：

- PostgreSQL (端口 5432)
- Redis (端口 6379)

等待约10秒让服务完全启动。

### 步骤4: 初始化数据库

```bash
cd packages/database
pnpm db:generate
pnpm db:migrate
cd ../..
```

### 步骤5: 启动开发服务器

```bash
pnpm dev
```

这将同时启动：

- 🔹 **后端API**: http://localhost:4000
- 🔹 **Swagger文档**: http://localhost:4000/api/docs

> ⚠️ 前端应用尚未创建，目前只有后端API可用

---

## 📝 测试API

### 1. 注册用户

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

响应示例：

```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "cm0abc123...",
        "email": "test@example.com",
        "name": "Test User",
        "role": "USER"
    }
}
```

### 2. 登录

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. 创建知识库

保存上一步的`access_token`，然后：

```bash
curl -X POST http://localhost:4000/knowledge-bases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "我的知识库",
    "description": "第一个测试知识库",
    "isPublic": false
  }'
```

### 4. 查看Swagger文档

浏览器打开: http://localhost:4000/api/docs

可以在线测试所有API端点！

---

## 🐛 常见问题

### Q: Docker容器无法启动？

**A:** 检查端口占用：

```bash
# Windows
netstat -ano | findstr :5432
netstat -ano | findstr :6379

# Mac/Linux
lsof -i :5432
lsof -i :6379
```

停止占用端口的进程或修改`docker-compose.yml`中的端口映射。

### Q: Prisma迁移失败？

**A:** 重置数据库（⚠️ 会删除所有数据）：

```bash
cd packages/database
pnpm db:reset
pnpm db:migrate
```

### Q: 找不到模块错误？

**A:** 重新安装依赖：

```bash
pnpm clean
pnpm install
```

### Q: OpenAI API调用失败？

**A:** 检查：

1. `OPENAI_API_KEY`是否正确设置
2. 账户是否有余额
3. 网络连接是否正常

测试API Key：

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

## 📊 项目结构速览

```
RagAIProject/
├── apps/
│   └── api/              # Nest.js后端 ← 当前工作区
│       ├── src/
│       │   ├── modules/  # 业务模块
│       │   ├── database/ # Prisma服务
│       │   └── main.ts   # 入口文件
│       └── uploads/      # 临时文件存储
│
├── packages/             # 共享库
│   ├── database/         # Prisma schema
│   ├── ai/               # AI封装
│   ├── document-parser/  # 文档解析
│   ├── shared-types/     # TypeScript类型
│   └── config/           # 配置管理
│
└── docker-compose.yml    # 本地服务编排
```

---

## 🎯 下一步

1. **完善前端应用** - 创建Next.js前端
2. **添加更多文档格式支持** - PPT, Excel等
3. **实现流式响应** - SSE实时聊天
4. **集成对象存储** - AWS S3 / Cloudflare R2
5. **添加单元测试** - Vitest测试套件

---

## 📞 需要帮助？

- 查看 [README.md](../README.md) 了解完整架构
- 查看 [plan.md](../plan.md) 了解实施计划
- 检查API日志：`docker-compose logs -f api`

祝开发愉快！🎉
