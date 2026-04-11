# 🚀 快速启动指南

## ⚡ 最快速的开发启动方式

### Windows用户

```bash
start-dev.bat
```

### Mac/Linux用户

```bash
chmod +x start-dev.sh && ./start-dev.sh
```

执行完脚本后,再运行:

```bash
pnpm run dev
```

就这么简单!🎉

---

## 📍 访问地址

| 服务           | 地址                           | 说明          |
| -------------- | ------------------------------ | ------------- |
| 🌐 前端        | http://localhost:3000          | Next.js应用   |
| 🔧 后端API     | http://localhost:4000          | Nest.js API   |
| 📚 Swagger文档 | http://localhost:4000/api/docs | API文档和测试 |
| 💾 PostgreSQL  | localhost:5432                 | 数据库        |
| 🗄️ Redis       | localhost:6379                 | 缓存/队列     |

---

## 🎯 常用命令速查

### 启动服务

```bash
# 启动数据库(PostgreSQL + Redis)
pnpm db:start

# 启动前后端开发服务器
pnpm dev

# 单独启动后端
cd apps/backend && pnpm start:dev

# 单独启动前端
cd apps/frontend && pnpm dev
```

### 停止服务

```bash
# 停止数据库
pnpm db:stop

# 重置数据库(删除所有数据)
pnpm db:reset
```

### Docker操作

```bash
# 查看容器状态
docker compose ps

# 查看日志
docker compose logs -f

# 重启服务
docker compose restart

# 完全清理
docker compose down -v
```

### 数据库操作

```bash
# 生成Prisma Client
cd packages/database && pnpm db:generate

# 运行迁移
cd packages/database && pnpm db:migrate

# 打开Prisma Studio
cd packages/database && pnpm db:studio
```

---

## 🔧 故障排查

### 问题1: 端口被占用

```bash
# 检查谁在使用5432端口
netstat -ano | findstr :5432

# 杀死进程(替换PID)
taskkill /PID <PID> /F
```

### 问题2: Docker未启动

```bash
# Windows: 启动Docker Desktop
# Mac: 启动Docker Desktop
# Linux: sudo systemctl start docker
```

### 问题3: 依赖安装失败

```bash
# 清除缓存重新安装
pnpm store prune
rm -rf node_modules
pnpm install
```

### 问题4: 数据库连接失败

```bash
# 检查PostgreSQL是否运行
docker compose ps postgres

# 查看日志
docker compose logs postgres

# 重启数据库
docker compose restart postgres
```

---

## 📦 环境变量配置

编辑 `.env` 文件:

```env
# OpenAI API Key (必需)
OPENAI_API_KEY=sk-your-api-key-here

# 数据库URL (默认即可)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rag_ai_db

# Redis URL (默认即可)
REDIS_URL=redis://localhost:6379

# JWT密钥 (生产环境请修改)
JWT_SECRET=change-this-to-a-random-string

# 其他可选配置
NODE_ENV=development
PORT=4000
```

---

## 💡 提示

✅ **推荐工作流程:**

1. 运行 `start-dev.bat` (或 `start-dev.sh`)
2. 运行 `pnpm dev`
3. 开始编码,享受热重载!

✅ **调试技巧:**

- 后端: VS Code中设置断点,F5启动调试
- 前端: Chrome DevTools直接调试
- 数据库: 使用Prisma Studio可视化查看

✅ **性能优化:**

- 首次启动较慢是正常的
- 后续启动只需几秒
- 保持Docker Desktop运行以加快启动速度

---

## 📚 更多文档

- [DOCKER_GUIDE.md](DOCKER_GUIDE.md) - 详细Docker使用指南
- [README.md](README.md) - 完整项目文档
- [QUICKSTART.md](QUICKSTART.md) - 入门教程
- [DEPLOYMENT.md](DEPLOYMENT.md) - 部署指南

---

**有问题?** 查看完整文档或在GitHub提Issue 🐛
