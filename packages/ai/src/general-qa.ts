import { HumanMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { config } from '@rag-ai/config';
import { ChatDeepSeek } from '@langchain/deepseek';
// 初始化 ChatDeepSeek 实例
const client = new ChatDeepSeek({
    apiKey: config.OPENAI_API_KEY, // 从环境变量读取 API Key
    model: 'deepseek-chat', // 指定 DeepSeek 的模型名称
    configuration: {
        baseURL: 'https://api.deepseek.com/v1', // DeepSeek 的 OpenAI 兼容端点
    },
    // 可选参数示例
    temperature: 0.7, // 控制回答的创造性 (范围0-2)
    maxRetries: 2, // 请求失败时的重试次数[reference:2][reference:3]
} as any);
// 封装一个异步函数来处理对话请求
export async function askDeepSeek(prompt: string) {
    try {
        // 使用 LangChain v1 的消息格式
        const messages: BaseMessage[] = [
            new SystemMessage('你需要什么帮助呢？'),
            new HumanMessage(prompt),
        ];
        // 调用模型并获取结果
        const response = await client.invoke(messages as any);
        // 返回模型生成的文本内容
        return (response as any).content;
    } catch (error) {
        console.error('调用 DeepSeek API 时发生错误:', error);
        // 可以在这里进行更精细的错误处理，比如根据不同错误类型返回不同提示
        throw new Error('无法处理您的请求，请稍后再试。');
    }
}
