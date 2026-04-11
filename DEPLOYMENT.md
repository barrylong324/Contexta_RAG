# 🚀 部署指南 - RAG AI Knowledge Base

## 📋 部署前检查清单

### ✅ 准备工作

- [ ] 所有功能在本地测试通过
- [ ] 环境变量已配置（特别是OpenAI API密钥）
- [ ] 数据库迁移已运行
- [ ] 生产构建测试通过（`pnpm build`）
- [ ] 没有控制台错误或警告
- [ ] 性能优化完成（图片、代码分割等）

---

## 🌐 部署方案对比

### 方案A: Vercel + Railway（⭐ 推荐）

**优点**:

- ✅ 零配置部署
- ✅ 自动HTTPS
- ✅ 全球CDN
- ✅ 免费额度充足
- ✅ 自动扩缩容

**缺点**:

- ❌ 冷启动延迟（免费版）
- ❌ 函数执行时间限制

---

### 方案B: 传统VPS自托管

**优点**:

- ✅ 完全控制
- ✅ 成本可预测
- ✅ 无供应商锁定

**缺点**:

- ❌ 需要运维知识
- ❌ 手动维护更新
- ❌ 安全性责任自负

---

### 方案C: Kubernetes集群

**优点**:

- ✅ 企业级可靠性
- ✅ 精细的资源控制
- ✅ 高可用性

**缺点**:

- ❌ 复杂度高
- ❌ 学习曲线陡峭
- ❌ 运维成本高

---

## 🎯 方案A: Vercel + Railway 部署（详细步骤）

### 第1步: 准备GitHub仓库

```bash
# 初始化Git（如果还没有）
git init
git add .
git commit -m "Initial commit: RAG AI Knowledge Base"

# 推送到GitHub
git remote add origin https://github.com/yourusername/rag-ai-kb.git
git push -u origin main
```

---

### 第2步: 部署后端到Railway

#### 2.1 创建Railway账户

访问 [railway.app](https://railway.app) 并登录

#### 2.2 创建新项目

1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择你的仓库

#### 2.3 添加PostgreSQL数据库

1. 在项目页面点击 "+ New"
2. 选择 "Database" → "Add PostgreSQL"
3. 等待数据库 provision

#### 2.4 添加Redis

1. 点击 "+ New"
2. 选择 "Database" → "Add Redis"
3. 等待Redis provision

#### 2.5 配置环境变量

在Railway项目设置中添加以下变量：

```env
# Database
DATABASE_URL=<从PostgreSQL服务获取>

# Redis
REDIS_HOST=<从Redis服务获取>
REDIS_PORT=6379
REDIS_PASSWORD=<从Redis服务获取>

# OpenAI
OPENAI_API_KEY=sk-your-openai-key-here

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRATION=7d

# App
NODE_ENV=production
PORT=4000
API_VERSION=v1

# CORS
ALLOWED_ORIGINS=https://your-app.vercel.app

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/tmp/uploads
```

#### 2.6 配置Railway服务

编辑 `apps/api/railway.toml`:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "cd apps/api && pnpm start:prod"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

#### 2.7 触发部署

1. 推送代码到main分支
2. Railway自动检测并部署
3. 等待部署完成
4. 复制生成的URL（例如: `https://api.railway.app`）

---

### 第3步: 部署前端到Vercel

#### 3.1 创建Vercel账户

访问 [vercel.com](https://vercel.com) 并用GitHub登录

#### 3.2 导入项目

1. 点击 "Add New Project"
2. 选择你的GitHub仓库
3. Vercel会自动检测Next.js

#### 3.3 配置构建设置

- **Framework Preset**: Next.js
- **Root Directory**: `apps/web`
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`

#### 3.4 添加环境变量

```env
NEXT_PUBLIC_API_URL=https://api.railway.app
```

#### 3.5 部署

点击 "Deploy"，等待约1-2分钟

#### 3.6 自定义域名（可选）

1. 进入项目设置 → Domains
2. 添加你的域名
3. 按照DNS配置指引

---

### 第4步: 配置Neon/Supabase数据库（替代Railway PG）

#### 为什么？

Railway的PostgreSQL是临时的，生产环境建议使用专业数据库服务。

#### Neon (推荐)

1. 访问 [neon.tech](https://neon.tech)
2. 创建免费项目
3. 创建数据库分支
4. 启用pgvector扩展：
    ```sql
    CREATE EXTENSION IF NOT EXISTS vector;
    ```
5. 复制连接字符串
6. 更新Railway的 `DATABASE_URL`

#### Supabase

1. 访问 [supabase.com](https://supabase.com)
2. 创建新组织/项目
3. 在SQL编辑器中启用pgvector：
    ```sql
    create extension if not exists vector;
    ```
4. 获取连接字符串
5. 更新环境变量

---

### 第5步: 配置Upstash Redis（替代Railway Redis）

1. 访问 [upstash.com](https://upstash.com)
2. 创建免费数据库
3. 选择区域（靠近你的用户）
4. 复制REST URL和Token
5. 更新Railway环境变量：
    ```env
    REDIS_HOST=<from Upstash>
    REDIS_PORT=6379
    REDIS_PASSWORD=<from Upstash>
    ```

---

## 🔧 方案B: VPS自托管部署

### 服务器要求

- **CPU**: 2 cores minimum
- **RAM**: 4GB minimum
- **Storage**: 20GB SSD
- **OS**: Ubuntu 22.04 LTS

### 第1步: 服务器初始化

```bash
# SSH到服务器
ssh root@your-server-ip

# 更新系统
apt update && apt upgrade -y

# 安装必要软件
apt install -y curl wget git nginx certbot python3-certbot-nginx

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 安装pnpm
npm install -g pnpm

# 安装Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER
```

### 第2步: 克隆代码

```bash
cd /opt
git clone https://github.com/yourusername/rag-ai-kb.git
cd rag-ai-kb
pnpm install
```

### 第3步: 配置环境变量

```bash
cp .env.example .env.production
nano .env.production
```

填入生产环境的值。

### 第4步: 构建应用

```bash
# 构建后端
cd apps/api
pnpm build

# 构建前端
cd ../web
pnpm build
```

### 第5步: 安装PM2

```bash
npm install -g pm2

# 创建PM2配置文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'rag-api',
      cwd: './apps/api',
      script: 'pnpm',
      args: 'start:prod',
      instances: 2,
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    },
    {
      name: 'rag-web',
      cwd: './apps/web',
      script: 'pnpm',
      args: 'start',
      instances: 1,
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
EOF
```

### 第6步: 启动服务

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd
```

### 第7步: 配置Nginx

```bash
cat > /etc/nginx/sites-available/rag-ai-kb << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header Host \$http_host;
    }
}
EOF

ln -s /etc/nginx/sites-available/rag-ai-kb /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 第8步: 配置SSL证书

```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 第9步: 设置数据库

```bash
# 使用Docker Compose启动PostgreSQL和Redis
docker-compose up -d

# 运行迁移
cd apps/api
pnpm db:migrate
```

### 第10步: 配置防火墙

```bash
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw enable
```

---

## 📊 监控与日志

### 应用监控

#### Sentry（错误追踪）

```bash
# 安装Sentry SDK
pnpm add @sentry/node @sentry/nextjs

# 配置Sentry
# apps/api/src/main.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
});
```

#### LogRocket（用户体验）

```bash
# 前端安装
pnpm add logrocket

# 初始化
import LogRocket from 'logrocket';
LogRocket.init('your-app-id');
```

### 基础设施监控

#### UptimeRobot（正常运行时间）

- 免费监控每5分钟检查一次
- 邮件/SMS告警

#### Datadog/New Relic（高级监控）

- APM性能监控
- 基础设施指标
- 日志聚合

---

## 🔒 安全加固

### 1. 环境变量安全

```bash
# 不要提交.env文件到Git
echo ".env*" >> .gitignore

# 使用加密的环境变量存储
# Vercel/Railway都提供加密环境变量
```

### 2. HTTPS强制

```nginx
# Nginx配置
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://\$server_name\$request_uri;
}
```

### 3. 速率限制

```typescript
// Nest.js ThrottlerModule
@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
  ],
})
```

### 4. Helmet安全头

```typescript
// Nest.js main.ts
import helmet from 'helmet';
app.use(helmet());
```

### 5. CORS配置

```typescript
// 只允许特定域名
app.enableCors({
    origin: ['https://your-domain.com'],
    credentials: true,
});
```

---

## 🔄 CI/CD自动化

### GitHub Actions示例

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
    push:
        branches: [main]

jobs:
    test:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3

            - name: Setup Node.js
              uses: actions/setup-node@v3
              with:
                  node-version: '18'

            - name: Install pnpm
              uses: pnpm/action-setup@v2

            - name: Install dependencies
              run: pnpm install

            - name: Run tests
              run: pnpm test

            - name: Build
              run: pnpm build

    deploy-backend:
        needs: test
        runs-on: ubuntu-latest
        steps:
            - name: Deploy to Railway
              uses: railwayapp/cli-action@v2
              with:
                  railwayToken: \${{ secrets.RAILWAY_TOKEN }}
                  command: up --detach

    deploy-frontend:
        needs: test
        runs-on: ubuntu-latest
        steps:
            - name: Deploy to Vercel
              uses: amondnet/vercel-action@v20
              with:
                  vercel-token: \${{ secrets.VERCEL_TOKEN }}
                  vercel-org-id: \${{ secrets.ORG_ID }}
                  vercel-project-id: \${{ secrets.PROJECT_ID }}
```

---

## 💰 成本估算

### 方案A: Vercel + Railway（每月）

| 服务       | 免费层    | 付费层       |
| ---------- | --------- | ------------ |
| Vercel     | ✅ 免费   | $20/pro      |
| Railway    | $5 credit | ~$10-20      |
| Neon DB    | ✅ 免费   | $29/pro      |
| Upstash    | ✅ 免费   | $10+         |
| OpenAI API | ❌        | ~$10-50      |
| **总计**   | **~$0-5** | **~$70-130** |

### 方案B: VPS自托管（每月）

| 服务                      | 成本                 |
| ------------------------- | -------------------- |
| VPS (DigitalOcean/Linode) | $10-20               |
| Domain Name               | $10/year             |
| SSL Certificate           | Free (Let's Encrypt) |
| OpenAI API                | $10-50               |
| **总计**                  | **~$20-80**          |

---

## 🆘 故障排除

### 常见问题

#### 1. 部署失败：依赖缺失

```bash
# 清除缓存重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 2. 数据库连接超时

```bash
# 检查防火墙规则
# 验证DATABASE_URL格式
# 确保pgvector扩展已启用
```

#### 3. CORS错误

```typescript
// 确保后端CORS配置包含前端域名
origin: ['https://your-frontend.vercel.app'];
```

#### 4. 内存不足

```bash
# 增加Node.js内存限制
NODE_OPTIONS="--max-old-space-size=4096" pnpm start
```

#### 5. 端口冲突

```bash
# 更改端口
PORT=4001 pnpm start
```

---

## 📈 性能优化

### 前端优化

```javascript
// next.config.mjs
const nextConfig = {
    images: {
        domains: ['your-cdn.com'],
    },
    experimental: {
        optimizePackageImports: ['lucide-react'],
    },
    compress: true,
};
```

### 后端优化

```typescript
// 启用compression
import compression from 'compression';
app.use(compression());

// 数据库连接池
// Prisma默认使用连接池，调整大小：
// DATABASE_URL="?connection_limit=20"
```

### CDN配置

- Vercel自动提供全球CDN
- 静态资源缓存策略
- Edge Functions降低延迟

---

## 🎯 部署后验证

### 检查清单

- [ ] 网站可通过HTTPS访问
- [ ] 所有页面加载正常
- [ ] API端点响应正确
- [ ] 用户可以注册/登录
- [ ] 文档上传成功
- [ ] AI聊天返回答案
- [ ] 移动端显示正常
- [ ] 浏览器控制台无错误
- [ ] Google Lighthouse评分 > 90

### 性能测试

```bash
# 使用Lighthouse CLI
npx lighthouse https://your-domain.com --view

# 目标分数
# Performance: > 90
# Accessibility: > 90
# Best Practices: > 90
# SEO: > 90
```

---

## 📞 支持与维护

### 日常维护任务

- 每周检查错误日志
- 每月更新依赖包
- 每季度审查安全漏洞
- 备份数据库（每日自动）

### 紧急联系人

- Vercel Status: [vercel.com/status](https://vercel.com/status)
- Railway Status: [status.railway.app](https://status.railway.app)
- OpenAI Status: [status.openai.com](https://status.openai.com)

---

## 🎉 部署成功！

恭喜！你的RAG AI知识库应用现在已经上线并可被全世界访问！

**下一步**:

1. 分享链接给用户测试
2. 收集反馈并迭代
3. 监控性能和错误
4. 规划新功能

**Happy Deploying! 🚀**

---

_Last Updated: 2026-04-10_
