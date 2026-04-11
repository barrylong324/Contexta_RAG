# Docker 使用指南

本项目提供了两种Docker使用方式,你可以根据需求选择最适合的方式。

## 🚀 推荐方案:混合模式(开发首选)

**特点:**

- ✅ 数据库运行在Docker容器中(PostgreSQL + Redis)
- ✅ 前后端在本地运行,便于调试和热重载
- ✅ 启动速度快,无需等待容器构建
- ✅ 可以使用VS Code断点调试

### 快速启动

**Windows用户:**

```bash
start-dev.bat
```

**Mac/Linux用户:**

```bash
chmod +x start-dev.sh
./start-dev.sh
```

这个脚本会自动:

1. 启动PostgreSQL和Redis容器
2. 安装项目依赖(`pnpm install`)
3. 生成Prisma Client
4. 运行数据库迁移

### 启动应用

脚本执行完成后,你可以选择以下方式启动应用:

#### 方式A: 使用Turbo同时启动前后端(推荐)

```bash
pnpm run dev
```

#### 方式B: 分别启动(适合独立调试)

**终端1 - 后端:**

```bash
cd apps/backend
pnpm run start:dev
```

**终端2 - 前端:**

```bash
cd apps/frontend
pnpm run dev
```

### 访问地址

- 🌐 前端应用: http://localhost:3000
- 🔧 后端API: http://localhost:4000
- 📚 Swagger文档: http://localhost:4000/api/docs
- 💾 PostgreSQL: localhost:5432
- 🗄️ Redis: localhost:6379

### 停止服务

```bash
docker-compose down
```

---

## 🐳 备选方案:全容器化部署

**特点:**

- ✅ 所有服务都在Docker容器中运行
- ✅ 环境完全隔离,避免本地环境问题
- ❌ 首次构建时间长(5-10分钟)
- ❌ 调试相对复杂

### 快速启动

**Windows用户:**

```bash
start.bat
```

**Mac/Linux用户:**

```bash
chmod +x start.sh
./start.sh
```

或直接使用docker compose:

```bash
docker compose up --build -d
```

### 查看日志

```bash
# 查看所有服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### 重启服务

```bash
# 重启单个服务
docker compose restart backend

# 重建并重启单个服务
docker compose up -d --build backend
```

### 停止服务

```bash
# 停止但不删除容器和数据
docker compose down

# 完全清理(包括数据卷)
docker compose down -v
```

---

## 🔧 常见问题

### 1. 端口被占用

如果5432或6379端口已被占用,可以修改`docker-compose.yml`中的端口映射:

```yaml
ports:
    - '5433:5432' # 将宿主机的5433映射到容器的5432
```

同时更新`.env`文件中的`DATABASE_URL`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/rag_ai_db
```

### 2. 数据库连接失败

检查PostgreSQL是否正常运行:

```bash
docker compose ps postgres
```

查看PostgreSQL日志:

```bash
docker compose logs postgres
```

重置数据库(⚠️ 会删除所有数据):

```bash
docker compose down -v postgres
docker compose up -d postgres
cd packages/database
pnpm exec prisma migrate deploy
```

### 3. 构建速度慢

**优化建议:**

- 确保Docker Desktop有足够的内存分配(建议8GB+)
- 使用`.dockerignore`排除不必要的文件
- 利用Docker缓存,不要频繁使用`--no-cache`

### 4. Prisma Client未找到

如果在容器中遇到Prisma错误:

```bash
docker compose exec backend sh
cd /app/packages/database
pnpm exec prisma generate
exit
docker compose restart backend
```

### 5. 环境变量配置

确保`.env`文件中配置了必要的环境变量:

```env
# 必需
OPENAI_API_KEY=sk-your-api-key-here

# 数据库(默认值)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rag_ai_db

# Redis(默认值)
REDIS_URL=redis://localhost:6379

# JWT密钥(生产环境请修改)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

---

## 📊 性能对比

| 指标         | 混合模式     | 全容器模式 |
| ------------ | ------------ | ---------- |
| 首次启动时间 | ~2分钟       | ~10分钟    |
| 后续启动时间 | ~30秒        | ~1分钟     |
| 代码修改生效 | 即时(热重载) | 需重新构建 |
| 调试便利性   | ⭐⭐⭐⭐⭐   | ⭐⭐⭐     |
| 环境一致性   | ⭐⭐⭐⭐     | ⭐⭐⭐⭐⭐ |
| 资源占用     | 中等         | 较高       |

---

## 🎯 最佳实践

### 开发环境

推荐使用**混合模式**:

- 数据库用Docker保证环境一致
- 前后端本地运行方便调试
- 享受TypeScript的热重载特性

### 测试环境

可以使用**全容器模式**:

- 模拟生产环境
- 验证Docker配置正确性

### 生产环境

建议使用专门的CI/CD流程:

- 单独构建前后端镜像
- 使用Kubernetes或云服务平台部署
- 配置负载均衡和健康检查

---

## 📝 技术细节

### Docker Compose服务说明

```yaml
services:
    postgres: # PostgreSQL数据库,带pgvector扩展
    redis: # Redis缓存和消息队列
    backend: # Nest.js后端API (可选)
    frontend: # Next.js前端应用 (可选)
```

### 网络架构

所有服务通过Docker网络`rag_ai_network`通信:

- 容器间使用服务名访问(如`postgres`, `redis`)
- 宿主机通过localhost访问暴露的端口

### 数据持久化

使用Docker volumes保存数据:

- `postgres_data`: PostgreSQL数据文件
- `redis_data`: Redis持久化数据

即使容器重启,数据也不会丢失。

---

## 🔗 相关文档

- [QUICKSTART.md](QUICKSTART.md) - 快速开始指南
- [DEPLOYMENT.md](DEPLOYMENT.md) - 生产环境部署
- [ARCHITECTURE.md](ARCHITECTURE.md) - 系统架构说明
