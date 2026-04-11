// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: PaginationMeta;
}

export interface ApiError {
    code: string;
    message: string;
    details?: any;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// ============================================
// User Types
// ============================================

export interface UserProfile {
    id: string;
    email: string;
    name?: string;
    image?: string;
    role: 'ADMIN' | 'USER' | 'GUEST';
    createdAt: Date;
}

// ============================================
// Knowledge Base Types
// ============================================

export interface KnowledgeBase {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    isPublic: boolean;
    ownerId: string;
    documentCount?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateKnowledgeBaseInput {
    name: string;
    id?: string;
    description?: string;
    icon?: string;
    isPublic?: boolean;
}

export interface UpdateKnowledgeBaseInput {
    id?: string;
    name?: string;
    description?: string;
    icon?: string;
    isPublic?: boolean;
}

// ============================================
// Document Types
// ============================================

export interface Document {
    id: string;
    title: string;
    description?: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    mimeType: string;
    knowledgeBaseId: string;
    uploadedById: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    tags: string[];
    metadata?: any;
    processingError?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DocumentWithProgress extends Document {
    progress?: number; // 0-100
    estimatedTimeRemaining?: number; // seconds
}

export interface UploadDocumentInput {
    title: string;
    description?: string;
    knowledgeBaseId: string;
    tags?: string[];
}

// ============================================
// Chat & Conversation Types
// ============================================

export interface Conversation {
    id: string;
    title?: string;
    userId: string;
    knowledgeBaseId?: string;
    messageCount?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Message {
    id: string;
    conversationId: string;
    role: 'USER' | 'ASSISTANT' | 'SYSTEM';
    content: string;
    sources?: SourceReference[];
    rating?: 'UPVOTE' | 'DOWNVOTE';
    feedback?: string;
    createdAt: Date;
}

export interface SourceReference {
    chunkId: string;
    documentId: string;
    documentTitle: string;
    score: number;
    content: string;
    pageNumber?: number;
}

export interface SendMessageInput {
    conversationId?: string;
    knowledgeBaseId?: string;
    message: string;
}

export interface ChatResponse {
    messageId: string;
    conversationId: string;
    answer: string;
    sources: SourceReference[];
}

// ============================================
// Search Types
// ============================================

export interface SearchQuery {
    query: string;
    knowledgeBaseId?: string;
    limit?: number;
    threshold?: number;
}

export interface SearchResult {
    chunkId: string;
    documentId: string;
    documentTitle: string;
    content: string;
    score: number;
    metadata?: any;
}

// ============================================
// Collaboration Types
// ============================================

export interface Collaboration {
    id: string;
    userId: string;
    userEmail: string;
    userName?: string;
    knowledgeBaseId: string;
    role: 'OWNER' | 'EDITOR' | 'VIEWER';
    createdAt: Date;
}

export interface InviteMemberInput {
    email: string;
    role: 'EDITOR' | 'VIEWER';
}

// ============================================
// Task Queue Types
// ============================================

export interface ProcessingTask {
    taskId: string;
    documentId: string;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    progress: number;
    error?: string;
    createdAt: Date;
    completedAt?: Date;
}
