# 技术深度解析 - RAG AI 知识库

> 本文档详细解释项目的关键技术决策和实现原理，帮助深入理解系统。

---

## 🏗️ 架构设计决策

### 为什么选择 Monorepo？

**背景**: 传统多仓库 vs Monorepo

| 维度        | 多仓库              | Monorepo        |
| ----------- | ------------------- | --------------- |
| 代码复用    | ❌ 需要发布npm包    | ✅ 直接import   |
| 依赖管理    | ❌ 版本不一致风险   | ✅ 统一版本     |
| 重构难度    | ❌ 跨仓库改动困难   | ✅ 原子性提交   |
| CI/CD复杂度 | ❌ 多个pipeline     | ✅ 单一pipeline |
| 新人上手    | ❌ 需要配置多个repo | ✅ 一次clone    |

**我们的选择**: Turborepo + pnpm workspace

**收益**:

- 共享 `@rag/shared-types` 确保前后端类型一致
- 共享 `@rag/database` 避免Prisma schema重复
- 原子性提交：一次commit包含前后端改动
- 增量构建：只编译变化的包

---

### 为什么选择 Nest.js 而不是 Express/Koa？

**Nest.js 的优势**:

1. **强制的模块化结构**

    ```typescript
    // 每个功能都是一个Module，职责清晰
    @Module({
        imports: [PrismaModule],
        controllers: [KnowledgeBasesController],
        providers: [KnowledgeBasesService],
        exports: [KnowledgeBasesService],
    })
    export class KnowledgeBasesModule {}
    ```

2. **依赖注入(DI)**
    - 便于单元测试（mock服务）
    - 松耦合设计
    - 符合SOLID原则

3. **装饰器元编程**

    ```typescript
    @Get(':id')
    @ApiOperation({ summary: '获取知识库详情' })
    @ApiResponse({ status: 200, type: KnowledgeBaseResponse })
    findOne(@Param('id') id: string) {
      return this.knowledgeBasesService.findOne(id);
    }
    ```

    - 声明式路由定义
    - 自动生成Swagger文档
    - 内置验证管道

4. **企业级特性开箱即用**
    - Guards（权限守卫）
    - Interceptors（请求拦截）
    - Filters（异常过滤）
    - Pipes（数据转换/验证）

**对比Express**:

```typescript
// Express - 需要手动组织
app.get('/api/kb/:id', authMiddleware, async (req, res) => {
  try {
    const kb = await kbService.findById(req.params.id);
    if (!kb) return res.status(404).json({ error: 'Not found' });
    res.json(kb);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Nest.js - 结构化、可测试
@Get(':id')
findOne(@Param('id') id: string) {
  return this.knowledgeBasesService.findOne(id);
}
// 异常由全局Filter处理，日志由Interceptor处理
```

---

## 🤖 RAG 核心技术详解

### 什么是 RAG？

**RAG (Retrieval-Augmented Generation)** = 检索增强生成

**传统LLM的问题**:

- ❌ 训练数据截止（知识过时）
- ❌ 幻觉问题（编造事实）
- ❌ 无法访问私有数据

**RAG的解决方案**:

```
用户提问 → 检索相关文档 → 作为上下文给LLM → 生成准确答案
```

### 我们的RAG实现流程

#### Step 1: 文档预处理

```typescript
// packages/document-parser/src/pdf.parser.ts
async parsePdf(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text; // 提取纯文本
}

// packages/document-parser/src/text-splitter.ts
splitText(text: string, chunkSize: number = 1000): string[] {
  // 递归字符分割，保持语义完整性
  return RecursiveCharacterTextSplitter.splitText(text, {
    chunkSize,
    chunkOverlap: 200, // 重叠避免切断句子
  });
}
```

**为什么chunk overlap?**

```
Chunk 1: "...机器学习是人工智能的一个子集。它使计算机能够..."
Chunk 2: "...它能够从数据中学习而不需要显式编程。深度学习..."
         ↑ 重叠部分确保上下文连贯
```

#### Step 2: 向量化存储

```typescript
// packages/ai/src/embeddings.ts
async generateEmbedding(text: string): Promise<number[]> {
  const embedding = new OpenAIEmbeddings({
    modelName: 'text-embedding-ada-002',
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  return await embedding.embedQuery(text);
  // 返回1536维向量
}

// 存入PostgreSQL pgvector
INSERT INTO document_chunks (content, embedding, document_id)
VALUES ($1, $2::vector, $3);
```

**为什么用pgvector而不是Pinecone/Chroma？**

- ✅ 无需额外服务（减少运维成本）
- ✅ ACID事务保证（与业务数据一致性）
- ✅ SQL联合查询（`JOIN documents ON ...`）
- ✅ 适合中小规模（<100万向量）
- ❌ 超大规模场景建议专用向量DB

#### Step 3: 检索增强

```typescript
// apps/api/src/modules/chat/chat.service.ts
async chatWithRAG(message: string, knowledgeBaseId: string) {
  // 1. 生成问题的向量
  const queryEmbedding = await this.aiService.generateEmbedding(message);

  // 2. 向量相似度搜索（余弦相似度）
  const relevantChunks = await this.prisma.documentChunk.findMany({
    where: {
      document: {
        knowledgeBaseId,
      },
    },
    orderBy: {
      embedding: {
        cosineDistance: queryEmbedding, // pgvector操作符
      },
    },
    take: 5, // Top-5最相关chunks
  });

  // 3. 构建Prompt
  const context = relevantChunks.map(c => c.content).join('\n\n');
  const prompt = `
    基于以下上下文回答问题。如果上下文中没有相关信息，请说"我不知道"。

    上下文:
    ${context}

    问题: ${message}

    答案:
  `;

  // 4. 调用GPT生成答案
  const response = await this.aiService.chat(prompt);

  return {
    answer: response,
    sources: relevantChunks.map(c => ({
      documentId: c.documentId,
      content: c.content.substring(0, 200) + '...',
    })),
  };
}
```

**相似度算法对比**:

| 算法               | 公式             | 适用场景               |
| ------------------ | ---------------- | ---------------------- | ----- | --- | --- | ---------------- | --- | --- | --- | ------------------------ |
| Cosine Similarity  | cos(θ) = A·B / ( |                        | A     |     | ·   |                  | B   |     | )   | 文本语义搜索（我们用的） |
| Euclidean Distance |                  |                        | A - B |     | ²   | 空间距离敏感场景 |
| Dot Product        | A·B              | 归一化向量等价于cosine |

---

## 🔐 认证授权机制

### JWT 双令牌策略

**Access Token** (短期):

- 有效期: 15分钟
- 用途: API请求认证
- 存储: 内存/Zustand store

**Refresh Token** (长期):

- 有效期: 7天
- 用途: 刷新access token
- 存储: HttpOnly Cookie（防XSS）

**流程图**:

```
登录成功
  ↓
返回 access_token + refresh_token
  ↓
前端存储并在请求头携带 access_token
  ↓
15分钟后 access_token 过期
  ↓
API返回 401 Unauthorized
  ↓
前端自动调用 /auth/refresh（携带refresh_token）
  ↓
获取新的 access_token
  ↓
重试原请求
```

**代码实现**:

```typescript
// apps/api/src/modules/auth/auth.service.ts
async login(email: string, password: string) {
  const user = await this.validateUser(email, password);

  const accessToken = this.jwtService.sign(
    { sub: user.id, email: user.email },
    { expiresIn: '15m' }
  );

  const refreshToken = this.jwtService.sign(
    { sub: user.id },
    { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET }
  );

  // 存储refresh token到数据库（用于撤销）
  await this.prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: hash(refreshToken),
      expiresAt: addDays(new Date(), 7),
    },
  });

  return { accessToken, refreshToken };
}

// Guard保护路由
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

// 使用
@UseGuards(JwtAuthGuard)
@Get('protected')
getProtectedData() {
  return { message: '只有认证用户可见' };
}
```

---

## ⚡ 异步任务处理

### 为什么需要消息队列？

**同步处理的问题**:

```
用户上传PDF (10MB)
  ↓
解析PDF (5秒)
  ↓
分块 (2秒)
  ↓
生成100个向量嵌入 (30秒) ← 用户等待37秒！
  ↓
返回成功
```

**异步处理的优势**:

```
用户上传PDF
  ↓
立即返回 "上传成功，处理中" (100ms)
  ↓
后台Worker慢慢处理...
  ↓
完成后更新状态为 COMPLETED
  ↓
前端轮询或WebSocket通知用户
```

### BullMQ 实现

```typescript
// apps/api/src/processors/document.processor.ts
@Processor('document-processing')
export class DocumentProcessor {
    @Process('vectorize')
    async handleVectorization(job: Job) {
        const { documentId } = job.data;

        try {
            // 1. 更新状态为 PROCESSING
            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: 'PROCESSING' },
            });

            // 2. 读取文件
            const file = await fs.readFile(document.filePath);

            // 3. 解析文档
            const text = await this.documentParser.parse(file);

            // 4. 分块
            const chunks = this.textSplitter.split(text);

            // 5. 生成向量并存入数据库
            for (const chunk of chunks) {
                const embedding = await this.aiService.generateEmbedding(chunk);
                await this.prisma.documentChunk.create({
                    data: {
                        content: chunk,
                        embedding,
                        documentId,
                    },
                });
            }

            // 6. 更新状态为 COMPLETED
            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: 'COMPLETED' },
            });
        } catch (error) {
            // 7. 失败重试或标记FAILED
            await this.prisma.document.update({
                where: { id: documentId },
                data: {
                    status: 'FAILED',
                    errorMessage: error.message,
                },
            });

            throw error; // BullMQ会自动重试
        }
    }
}

// 添加到队列
await this.documentQueue.add(
    'vectorize',
    {
        documentId: document.id,
    },
    {
        attempts: 3, // 最多重试3次
        backoff: {
            type: 'exponential',
            delay: 2000, // 指数退避: 2s, 4s, 8s
        },
    },
);
```

---

## 🗄️ 数据库设计要点

### 关键表关系

```sql
-- 多租户隔离
users (1) ----< (*) knowledge_bases
                         |
                         | (1)
                         |
                         v (*)
                   documents
                         |
                         | (1)
                         |
                         v (*)
                   document_chunks (含vector列)

-- 对话历史
users (1) ----< (*) conversations
                         |
                         | (1)
                         |
                         v (*)
                   messages

-- 协作权限
knowledge_bases (1) ----< (*) collaborations (*)----> (1) users
```

### pgvector 索引优化

```sql
-- 创建HNSW索引（近似最近邻搜索，速度更快）
CREATE INDEX idx_chunks_embedding
ON document_chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- m: 连接数（越大越准但越慢）
-- ef_construction: 构建时的候选列表大小
```

**性能对比**:

- 无索引: 10万向量扫描需要 ~500ms
- HNSW索引: 同样数据 ~10ms (50倍提升!)

---

## 🎨 前端架构亮点

### TanStack Query 缓存策略

```typescript
// 自动缓存、去重、后台刷新
const { data: knowledgeBases, isLoading } = useQuery({
    queryKey: ['knowledge-bases'], // 缓存key
    queryFn: () => apiClient.get('/knowledge-bases'),
    staleTime: 60 * 1000, // 1分钟内认为数据新鲜
    refetchOnWindowFocus: false, // 窗口聚焦不重新请求
});

// 突变后自动失效缓存
const mutation = useMutation({
    mutationFn: createKnowledgeBase,
    onSuccess: () => {
        queryClient.invalidateQueries(['knowledge-bases']); // 触发重新获取
    },
});
```

**好处**:

- ✅ 避免重复请求
- ✅ 乐观更新（Optimistic Updates）
- ✅ 后台静默刷新
- ✅ 请求去重（同一时刻相同请求只发一次）

---

## 🔍 性能优化技巧

### 1. 数据库查询优化

```typescript
// ❌ N+1 问题
const documents = await prisma.document.findMany();
for (const doc of documents) {
    const kb = await prisma.knowledgeBase.findUnique({
        where: { id: doc.knowledgeBaseId },
    });
}

// ✅ 使用 include 预加载
const documents = await prisma.document.findMany({
    include: {
        knowledgeBase: true,
        chunks: {
            select: { id: true, content: true },
        },
    },
});
```

### 2. React 组件优化

```typescript
// ❌ 每次渲染都创建新对象
<MyComponent config={{ theme: 'dark' }} />

// ✅ useMemo 缓存
const config = useMemo(() => ({ theme: 'dark' }), []);
<MyComponent config={config} />

// ❌ 箭头函数导致子组件重渲染
<button onClick={() => handleClick(id)}>Click</button>

// ✅ useCallback 稳定引用
const handleClickCallback = useCallback(() => handleClick(id), [id]);
<button onClick={handleClickCallback}>Click</button>
```

### 3. Bundle Size 优化

```javascript
// next.config.mjs
module.exports = {
    experimental: {
        optimizePackageImports: ['lucide-react'], // Tree shaking
    },
};

// 动态导入大组件
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
    loading: () => <Skeleton />,
    ssr: false, // 如果不需要SSR
});
```

---

## 🧪 测试策略（待实现）

### 单元测试示例

```typescript
// apps/api/src/modules/knowledge-bases/knowledge-bases.service.spec.ts
describe('KnowledgeBasesService', () => {
    let service: KnowledgeBasesService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                KnowledgeBasesService,
                {
                    provide: PrismaService,
                    useValue: mockDeep<PrismaClient>(),
                },
            ],
        }).compile();

        service = module.get(KnowledgeBasesService);
        prisma = module.get(PrismaService);
    });

    it('should create a knowledge base', async () => {
        const dto: CreateKnowledgeBaseDto = {
            name: 'Test KB',
            description: 'Test Description',
        };

        const userId = 'user-123';

        jest.spyOn(prisma.knowledgeBase, 'create').mockResolvedValue({
            id: 'kb-123',
            ...dto,
            ownerId: userId,
            isPublic: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        });

        const result = await service.create(dto, userId);

        expect(result.name).toBe('Test KB');
        expect(prisma.knowledgeBase.create).toHaveBeenCalledWith({
            data: {
                ...dto,
                ownerId: userId,
            },
        });
    });
});
```

---

## 📈 扩展方向

### 1. 实时协作

- WebSocket (Socket.io)
- Operational Transform (OT) 算法
- 类似Google Docs的协同编辑

### 2. 高级检索

- 混合搜索（关键词 + 向量）
- BM25算法
- 多语言支持

### 3. 权限细化

- RBAC (Role-Based Access Control)
- ABAC (Attribute-Based Access Control)
- 字段级权限控制

### 4. 监控告警

- Prometheus + Grafana
- ELK Stack (日志分析)
- Sentry (错误追踪)

---

## 🎓 学习资源

- [RAG论文原文](https://arxiv.org/abs/2005.11401)
- [pgvector官方文档](https://github.com/pgvector/pgvector)
- [Nest.js最佳实践](https://docs.nestjs.com/fundamentals/custom-providers)
- [TanStack Query深度指南](https://tkdodo.eu/blog/practical-react-query)

---

_本文档帮助你深入理解项目技术细节，面试时可参考此内容展示技术深度。_
