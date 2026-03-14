// types/mongoose.d.ts
import { Document } from 'mongoose';

// Extend Mongoose QueryOptions
declare module 'mongoose' {
  interface QueryOptions {
    sessionId?: string;
    date?: string;
    timestamp?: any;
  }
}

// Export interfaces for use in other files
export interface IConversation extends Document {
  sessionId: string;
  userMessage: string;
  botResponse: string;
  topic: string;
  page?: string;
  timestamp: Date;
  needsReview: boolean;
  reviewReason?: string;
  helpful?: boolean | null;
}

export interface IFeedback extends Document {
  conversationId: string;
  messageId: string;
  helpful: boolean;
  comment?: string;
  timestamp: Date;
}

export interface IQuery extends Document {
  query: string;
  count: number;
  lastAsked: Date;
  topics: string[];
  satisfactory: number;
  unsatisfactory: number;
}

export interface IAnalytics extends Document {
  date: string;
  totalConversations: number;
  totalMessages: number;
  uniqueUsers: number;
  topics: Map<string, number>;
  helpfulPercentage: number;
  topQueries: Array<{ query: string; count: number }>;
  lastUpdated: Date;
}