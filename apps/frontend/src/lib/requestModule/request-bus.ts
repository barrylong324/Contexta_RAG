// 为请求绑定业务层，接入内部协议规范和接口文档，向外提供业务接口api
import service from '@/lib/request'
import {
    CreateKnowledgeBaseInput,
    UpdateKnowledgeBaseInput,
    SendMessageDto,
} from '@rag-ai/shared-types'

// 1.auth模块
interface LoginOrRegister {
    email: string
    password: string
    name?: string
}
// 登录
export const contextRagLogin = (email: string, password: string) => {
    const param: LoginOrRegister = {
        email,
        password,
    } as LoginOrRegister
    return service({
        url: '/auth/login',
        method: 'post',
        data: param,
    })
}
// 注册
export const contextRagRegister = (email: string, password: string, name?: string) => {
    const param: LoginOrRegister = {
        email,
        password,
        name,
    } as LoginOrRegister
    return service({
        url: '/auth/register',
        method: 'post',
        data: param,
    })
}

// 2.user模块
// 获取当前用户
export const getUserData = () => {
    return service({
        url: '/users/me',
        method: 'get',
    })
}

// 获取当前用户id获取用户
export const getUserById = (params: string) => {
    return service({
        url: '/users',
        method: 'get',
        params,
    })
}

// 3.aigcChat模块
// 获取AI对话
export const getAigcNormalChatMessage = (content: string) => {
    return service({
        url: '/aigcChat/message',
        method: 'post',
        data: { content },
    })
}

// 获取所有对话
export const getAigcNormalChatAllMessage = () => {
    return service({
        url: '/aigcChat/conversations',
        method: 'get',
    })
}

// 获取会话中的消息
export const getAigcNormalChatIdMessage = (conversationId: string) => {
    return service({
        url: `/aigcChat/conversations/messages/${conversationId}`,
        method: 'get',
    })
}

// 删除对话
export const delAigcNormalChatMessage = (conversationId: string) => {
    return service({
        url: `/aigcChat/conversations/${conversationId}`,
        method: 'delete',
    })
}

// 4.ragChat模块
// 获取ragAI对话
export const getRagChatMessage = (params: SendMessageDto) => {
    return service({
        url: '/ragChat/message',
        method: 'post',
        data: params,
    })
}

// 获取所有rag对话
export const getRagChatAllMessage = (params: string) => {
    return service({
        url: '/ragChat/conversations',
        method: 'get',
        params,
    })
}

// 获取rag会话中的消息
export const getRagChatIdMessage = (conversationId: string) => {
    return service({
        url: `/ragChat/conversations/messages/${conversationId}`,
        method: 'get',
    })
}

// 删除rag对话
export const delRagChatMessage = (conversationId: string) => {
    return service({
        url: `/ragChat/conversations/${conversationId}`,
        method: 'del',
    })
}

// 5.knowledge-bases模块
// 批量获取知识库
export const getAllKnowledgeBases = () => {
    return service({
        url: '/knowledgeBases/getAllKnowledgeBases',
        method: 'get',
    })
}

// 根据知识库id查询知识库
export const getKnowledgeBasesById = (params: string) => {
    return service({
        url: '/knowledgeBases/getAllKnowledgeBases',
        method: 'get',
        params,
    })
}

// 新增知识库
export const addKnowledgeBases = (param: CreateKnowledgeBaseInput) => {
    return service({
        url: '/knowledgeBases/addKnowledgeBases',
        method: 'post',
        data: param,
    })
}

// 编辑知识库
export const editKnowledgeBases = (param: UpdateKnowledgeBaseInput) => {
    return service({
        url: '/knowledgeBases/updateKnowledgeBases',
        method: 'post',
        data: param,
    })
}

// 删除知识库
export const delKnowledgeBases = (id: string) => {
    return service({
        url: `/knowledgeBases/delKnowledgeBases/${id}`,
        method: 'delete',
    })
}

// 6.document模块
// 批量获取文档
export const getAllDocument = (kbId: string) => {
    return service({
        url: '/documents/allDoc',
        method: 'get',
        params: { kbId },
    })
}

// 根据文档id查询文档
export const getDocumentById = (id: string) => {
    return service({
        url: `/documents/allDoc/${id}`,
        method: 'get',
    })
}

// 根据文档id删除文档
export const delDocumentById = (id: string) => {
    return service({
        url: `/documents/allDoc/${id}`,
        method: 'delete',
    })
}

// 7.upload模块
// 文件上传
export const uploadFile = (formData: FormData) => {
    return service({
        url: '/upload',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
}
