# 面试准备清单 - RAG AI 知识库项目

> 使用本清单系统化准备面试，确保能自信地展示这个项目。

---

## ✅ 第一阶段：理解项目（1-2天）

### 1.1 通读代码

- [ ] 阅读 `apps/api/src/main.ts` - 理解Nest.js启动流程
- [ ] 阅读 `apps/web/src/app/layout.tsx` - 理解Next.js布局系统
- [ ] 阅读 `packages/database/prisma/schema.prisma` - 理解数据模型
- [ ] 阅读 `apps/api/src/modules/chat/chat.service.ts` - 理解RAG核心逻辑

### 1.2 运行项目

```bash
# 必须能独立执行以下步骤
pnpm install
docker-compose up -d
pnpm db:migrate
pnpm seed
pnpm dev
```

**验证点**:

- [ ] 能成功注册/登录
- [ ] 能创建知识库
- [ ] 能上传PDF/TXT文档
- [ ] 能看到文档处理状态变化（PENDING → PROCESSING → COMPLETED）
- [ ] 能在Chat页面提问并获得基于文档的回答
- [ ] 能查看对话历史

### 1.3 修改一个小功能

**练习任务**（选一个完成）:

- [ ] 在知识库列表页添加"删除"按钮
- [ ] 在Chat页面添加"清除对话"功能
- [ ] 修改默认chunk size从1000改为500
- [ ] 添加一个简单的统计API（返回用户创建的知识库数量）

**目的**: 证明你能读懂并修改代码

---

## ✅ 第二阶段：技术深度（2-3天）

### 2.1 能回答的核心问题

#### 架构类

- [ ] **为什么选择Monorepo？**
    <details>
    <summary>参考答案</summary>

    > "我们采用了Turborepo + pnpm workspace的Monorepo方案。主要考虑三点：
    >
    > 1. **代码复用**：前后端共享TypeScript类型定义（@rag/shared-types），避免接口变更时两端不同步
    > 2. **原子性提交**：一次commit可以同时修改API和前端调用方，保证一致性
    > 3. **开发体验**：统一的依赖管理和构建命令，新人只需`pnpm install`即可开始开发

    > 当然Monorepo也有缺点，比如仓库体积会变大，但对于我们这个规模的项目（~50个文件）来说利大于弊。"

    </details>

- [ ] **为什么不直接用Python做后端？**
    <details>
    <summary>参考答案</summary>

    > "虽然LangChain有Python版本，但我们选择Node.js生态有几个原因：
    >
    > 1. **全栈TypeScript**：前后端统一语言，类型安全，减少上下文切换
    > 2. **LangChain.js成熟度**：功能已经非常完善，支持所有主流LLM和向量数据库
    > 3. **团队技能匹配**：如果团队成员更熟悉JS/TS，学习成本更低
    > 4. **性能足够**：对于IO密集型的Web应用，Node.js的事件驱动模型表现很好

    > 当然如果是计算密集型任务（如大规模数据处理），Python可能更合适。"

    </details>

- [ ] **Nest.js相比Express的优势？**
    <details>
    <summary>参考答案</summary>

    > "Nest.js提供了企业级的架构约束：
    >
    > 1. **强制模块化**：每个功能都是独立的Module，便于维护和测试
    > 2. **依赖注入**：天然支持单元测试，可以轻松mock服务
    > 3. **装饰器元编程**：声明式的路由、验证、文档生成
    > 4. **内置最佳实践**：Guards、Interceptors、Filters等中间件模式

    > Express更灵活但也更容易写出面条代码，Nest.js适合中大型项目。"

    </details>

#### RAG技术类

- [ ] **解释RAG的工作流程**
    <details>
    <summary>参考答案</summary>

    > "RAG分为两个阶段：
    >
    > **索引阶段**（离线）：
    >
    > 1. 用户上传文档（PDF/TXT/DOCX）
    > 2. 解析成纯文本
    > 3. 按1000字符分块，重叠200字符保持语义连贯
    > 4. 每块通过OpenAI Embedding API生成1536维向量
    > 5. 存入PostgreSQL的pgvector扩展
    >
    > **检索阶段**（在线）：
    >
    > 1. 用户提问，同样生成问题向量
    > 2. 用余弦相似度搜索Top-5最相关的chunks
    > 3. 将这些chunks作为上下文拼接到Prompt
    > 4. 调用GPT-3.5/4生成答案
    > 5. 返回答案和引用来源
    >
    > 这样既利用了LLM的理解能力，又避免了幻觉问题。"

    </details>

- [ ] **为什么用pgvector而不是Pinecone/Chroma？**
    <details>
    <summary>参考答案</summary>

    > "这是权衡后的选择：
    >
    > **pgvector优势**：
    >
    > - 无需额外部署服务，降低运维复杂度
    > - ACID事务保证，与业务数据强一致
    > - 可以用SQL JOIN关联查询（比如只查某个用户的文档）
    > - 免费开源
    >
    > **专用向量DB优势**：
    >
    > - 超大规模场景性能更好（千万级向量）
    > - 提供更多算法选项（HNSW、IVF等）
    > - 云托管服务省心
    >
    > 对于我们这种中小规模应用（预计<10万文档），pgvector完全够用且成本更低。如果未来扩展到百万级，可以考虑迁移到Pinecone。"

    </details>

- [ ] **如何处理长文档？**
    <details>
    <summary>参考答案</summary>

    > "我们采用递归字符分割策略：
    >
    > 1. 优先在段落边界（\n\n）切分
    > 2. 其次在句子边界（.!?）切分
    > 3. 最后在单词边界切分
    >
    > 每个chunk设置1000字符，overlap 200字符。overlap很重要，避免切断关键信息。
    >
    > 对于超长文档（比如10万字），我们会：
    >
    > - 限制单次处理的文档大小（比如最大5MB）
    > - 异步队列处理，避免阻塞
    > - 提供进度反馈给用户
    >
    > 更高级的方案可以做层次化索引：先生成章节摘要，再对章节内分块，检索时先定位章节再找具体段落。"

    </details>

#### 数据库类

- [ ] **如何优化向量搜索性能？**
    <details>
    <summary>参考答案</summary>

    > "我们从三个层面优化：
    >
    > 1. **索引层**：创建HNSW索引
    >     ```sql
    >     CREATE INDEX idx_embedding ON chunks USING hnsw (embedding vector_cosine_ops);
    >     ```
    >     这能将10万向量的搜索从500ms降到10ms。
    > 2. **查询层**：限制搜索范围
    >     ```typescript
    >     // 先过滤用户自己的文档，再做向量搜索
    >     where: {
    >         document: {
    >             ownerId: userId;
    >         }
    >     }
    >     ```
    > 3. **应用层**：缓存热门问答
    >     ```typescript
    >     // Redis缓存相似问题的答案
    >     const cached = await redis.get(hash(question));
    >     if (cached) return JSON.parse(cached);
    >     ```
    >
    > 如果数据量继续增长，还可以考虑：
    >
    > - 分区表（按月/按用户分区）
    > - 读写分离
    > - 降级为近似搜索（牺牲精度换速度）"

    </details>

- [ ] **如何实现多租户数据隔离？**
    <details>
    <summary>参考答案</summary>

    > "我们在数据库层面和应用层面都做了隔离：
    >
    > **数据库层**：
    >
    > ```prisma
    > model KnowledgeBase {
    >   ownerId String  // 外键指向User
    >   owner   User    @relation(fields: [ownerId], references: [id])
    > }
    > ```
    >
    > **应用层**：
    >
    > ```typescript
    > // 所有查询都带上ownerId过滤
    > async findAll(userId: string) {
    >   return this.prisma.knowledgeBase.findMany({
    >     where: { ownerId: userId }
    >   });
    > }
    > ```
    >
    > **权限校验**：
    >
    > ```typescript
    > // 修改前检查所有权
    > async update(id: string, dto: UpdateDto, userId: string) {
    >   const kb = await this.findOne(id);
    >   if (kb.ownerId !== userId) {
    >     throw new ForbiddenException('无权操作');
    >   }
    >   // ...更新逻辑
    > }
    > ```
    >
    > 更复杂的场景可以用RBAC（角色权限控制），允许协作者访问但不是所有者。"

    </details>

#### 前端类

- [ ] **为什么用TanStack Query？**
    <details>
    <summary>参考答案</summary>

    > "TanStack Query解决了服务端状态管理的痛点：
    >
    > 1. **自动缓存**：相同queryKey的请求不会重复发送
    > 2. **后台刷新**：数据stale后会在后台静默更新
    > 3. **请求去重**：多个组件同时请求同一数据，只发一次HTTP请求
    > 4. **乐观更新**：可以先更新UI，失败再回滚
    > 5. **重试机制**：网络波动时自动重试
    >
    > 对比Redux/Zustand手动管理loading/error/data状态，TanStack Query让代码简洁很多：
    >
    > ````typescript
    > // 之前（Zustand手动管理）
    > const [data, setData] = useState(null);
    > const [loading, setLoading] = useState(true);
    > useEffect(() => {
    >   fetch('/api/kb').then(setData).finally(() => setLoading(false));
    > }, []);
    >
    > // 之后（TanStack Query）
    > const { data, isLoading } = useQuery({
    >   queryKey: ['kb'],
    >   queryFn: () => api.get('/kb')
    > });
    > ```"
    > ````

    </details>

- [ ] **如何处理认证token过期？**
    <details>
    <summary>参考答案</summary>

    > "我们实现了无感刷新token机制：
    >
    > 1. **Axios拦截器**：
    >
    > ```typescript
    > axios.interceptors.response.use(
    >     (response) => response,
    >     async (error) => {
    >         if (error.response?.status === 401 && !originalRequest._retry) {
    >             originalRequest._retry = true;
    >
    >             // 尝试刷新token
    >             const newToken = await refreshAccessToken();
    >
    >             // 用新token重试原请求
    >             originalRequest.headers.Authorization = `Bearer ${newToken}`;
    >             return axios(originalRequest);
    >         }
    >         return Promise.reject(error);
    >     },
    > );
    > ```
    >
    > 2. **Refresh Token存储**：
    >
    > - Access Token存在内存（Zustand store），防止XSS
    > - Refresh Token存在HttpOnly Cookie，JavaScript无法访问
    >
    > 3. **并发控制**：
    >    如果有多个请求同时401，只发起一次refresh请求，其他请求等待。
    >
    > 用户体验上，只要用户在7天内活跃过，就永远不会看到登录页面。"

    </details>

### 2.2 白板编码练习

**练习1**: 手写一个简单的向量相似度搜索

```typescript
// 不用pgvector，用纯JS实现
function cosineSimilarity(a: number[], b: number[]): number {
    // TODO: 实现余弦相似度
}

function findMostSimilar(query: number[], vectors: number[][], topK: number): number[] {
    // TODO: 返回最相似的topK个索引
}
```

<details>
<summary>参考答案</summary>

```typescript
function cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function findMostSimilar(query: number[], vectors: number[][], topK: number): number[] {
    const similarities = vectors.map((vec, idx) => ({
        index: idx,
        score: cosineSimilarity(query, vec),
    }));

    return similarities
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map((item) => item.index);
}
```

</details>

**练习2**: 设计一个限流中间件

```typescript
// 限制每个IP每分钟最多10次请求
@Injectable()
export class RateLimitGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        // TODO: 实现限流逻辑
    }
}
```

<details>
<summary>参考答案</summary>

```typescript
@Injectable()
export class RateLimitGuard implements CanActivate {
    private readonly requestCounts = new Map<string, { count: number; resetTime: number }>();

    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const ip = request.ip;
        const now = Date.now();

        const record = this.requestCounts.get(ip);

        if (!record || now > record.resetTime) {
            // 新的时间窗口
            this.requestCounts.set(ip, { count: 1, resetTime: now + 60000 });
            return true;
        }

        if (record.count >= 10) {
            throw new TooManyRequestsException('请求过于频繁，请稍后再试');
        }

        record.count++;
        return true;
    }
}
```

</details>

---

## ✅ 第三阶段：项目演示（半天）

### 3.1 准备Demo脚本

**5分钟演示流程**:

1. **开场** (30秒)

    > "这是一个基于RAG技术的AI知识库应用，用户可以上传私有文档，然后通过自然语言问答的方式获取信息。"

2. **展示注册登录** (30秒)
    - 打开 http://localhost:3000/register
    - 填写表单注册
    - 展示JWT token存储在localStorage

3. **创建知识库** (1分钟)
    - Dashboard点击"新建知识库"
    - 输入名称"产品文档"
    - 展示数据库中的记录（Prisma Studio或psql）

4. **上传文档** (1.5分钟)
    - 上传一个PDF文件（提前准备好）
    - 展示状态从PENDING → PROCESSING → COMPLETED
    - 解释后台Worker在做的事情（解析→分块→向量化）
    - 展示document_chunks表中的数据

5. **智能问答** (1.5分钟)
    - 进入Chat页面
    - 提问："产品的退款政策是什么？"
    - 展示AI回答和引用的文档片段
    - 对比不使用RAG的情况（GPT会说"我不知道"）

6. **技术亮点总结** (30秒)
    > "这个项目的技术亮点包括：Monorepo架构、RAG检索增强、pgvector向量搜索、异步任务队列、JWT双令牌认证。代码已开源在GitHub。"

### 3.2 录制演示视频（可选）

- 使用OBS或Loom录制5分钟demo
- 上传到YouTube/B站，简历中放链接
- 面试官没时间运行时可以看视频

---

## ✅ 第四阶段：扩展思考（1天）

### 4.1 如果被问到"你会如何改进这个项目？"

**准备3-5个改进方向**:

1. **实时协作**

    > "目前知识库是单人的，我会加入WebSocket实现多人实时协作编辑，类似Notion的体验。"

2. **高级检索**

    > "当前只用向量搜索，可以结合BM25关键词搜索做混合检索，提升准确率。"

3. **多模态支持**

    > "目前只支持文本，可以集成CLIP模型支持图片检索，或者Whisper支持音频转录。"

4. **监控告警**

    > "生产环境需要接入Prometheus监控API延迟、错误率，Sentry追踪前端异常。"

5. **国际化**
    > "使用i18next支持中英文切换，Embedding模型换成多语言的multilingual-e5-large。"

### 4.2 准备一个"踩坑故事"

**示例**:

> "开发过程中遇到一个性能问题：用户上传大PDF时，服务器内存暴涨甚至OOM。
>
> **排查过程**：
>
> 1. 用`process.memoryUsage()`发现Buffer占用过高
> 2. 定位到pdf-parse一次性加载整个文件到内存
> 3. 10MB PDF解压后可能达到100MB
>
> **解决方案**：
>
> 1. 改用流式处理：`fs.createReadStream`逐页解析
> 2. 限制单个文件大小不超过5MB
> 3. 异步队列处理，避免阻塞主线程
>
> **收获**：学会了Node.js Stream API和内存 profiling 技巧。"

---

## ✅ 第五阶段：简历优化

### 5.1 GitHub README美化

确保你的README包含：

- [ ] 醒目的项目截图/GIF动图
- [ ] 一键运行的Docker命令
- [ ] 清晰的架构图
- [ ] API文档链接（Swagger）
- [ ] 技术栈徽章（Shields.io）
- [ ] Live Demo链接（如果部署了）

### 5.2 LinkedIn/博客文章

写一篇技术博客：

- 标题示例：《从零搭建RAG AI知识库：技术选型与实践》
- 发布平台：掘金、知乎、Medium、Dev.to
- 内容大纲：
    1. 项目背景和需求分析
    2. 技术选型对比（为什么选X不选Y）
    3. 核心难点和解决方案
    4. 性能优化经验
    5. 源码地址和未来规划

**好处**：

- 展示写作能力和知识沉淀习惯
- 面试时可以分享链接
- 可能被HR主动联系

---

## 📋 最终检查清单

### 技术能力

- [ ] 能独立从头搭建项目骨架（不用复制粘贴）
- [ ] 能解释每一行关键代码的作用
- [ ] 能手写简单的向量搜索算法
- [ ] 能画出系统架构图和数据流程图
- [ ] 能说清楚至少3个技术选型的理由

### 项目理解

- [ ] 知道数据库每张表的用途和关系
- [ ] 了解API的所有端点和参数
- [ ] 明白RAG的完整工作流程
- [ ] 清楚认证授权的实现细节
- [ ] 知晓异步任务的处理机制

### 表达能力

- [ ] 能用1句话概括项目（电梯演讲）
- [ ] 能用5分钟演示核心功能
- [ ] 能用15分钟讲解技术架构
- [ ] 准备了3个以上"踩坑故事"
- [ ] 能回答常见的follow-up问题

### 材料准备

- [ ] GitHub仓库README完善
- [ ] 有Live Demo或演示视频
- [ ] 写了技术博客（加分项）
- [ ] 简历上的描述真实准确
- [ ] 准备好了STAR法则的故事案例

---

## 🎯 面试当天的Tips

1. **主动引导话题**
    - 不要等面试官问，主动介绍你最得意的部分
    - "我想特别介绍一下我们的RAG实现..."

2. **诚实但有策略**
    - ❌ "这个是我完全独立完成的"（容易被识破）
    - ✅ "我负责架构设计和核心逻辑，借助AI工具提升了编码效率"

3. **展示学习能力**
    - "开发过程中我学习了pgvector的使用，还读了LangChain的源码..."
    - "遇到问题我先看官方文档，然后查GitHub Issues，最后在社区提问"

4. **反问环节准备问题**
    - "贵公司的技术栈是什么？"
    - "团队如何做Code Review？"
    - "这个岗位的日常工作内容？"

5. **心态调整**
    - 面试官不是要难倒你，而是想了解你的思维方式
    - 遇到不会的问题可以说"这个我不太确定，但我的思路是..."
    - 重要的是展示解决问题的方法，而不是死记硬背答案

---

## 🚀 Bonus: 让项目更出彩

如果还有时间，可以做这些增强：

1. **添加单元测试**（覆盖率>60%）

    ```bash
    pnpm test:cov
    ```

2. **CI/CD Pipeline**
    - GitHub Actions自动测试
    - 自动部署到Vercel/Railway

3. **性能压测报告**

    ```bash
    npm install -g autocannon
    autocannon http://localhost:3000/api/knowledge-bases
    ```

4. **安全审计**

    ```bash
    npm audit
    npx eslint .
    ```

5. **移动端适配**
    - 响应式设计
    - PWA支持（离线可用）

---

**记住**：面试官不在乎代码是不是你一行行敲的，他们在乎的是：

1. 你是否理解这个系统
2. 你是否具备解决问题的能力
3. 你是否能快速学习和成长

祝面试顺利！🎉
