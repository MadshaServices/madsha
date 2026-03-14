// lib/schemas.ts
import mongoose, { Document, Model } from 'mongoose';

// Define interface for Conversation
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

// Define interface for Feedback
export interface IFeedback extends Document {
  conversationId: string;
  messageId: string;
  helpful: boolean;
  comment?: string;
  timestamp: Date;
}

// Define interface for Query
export interface IQuery extends Document {
  query: string;
  count: number;
  lastAsked: Date;
  topics: string[];
  satisfactory: number;
  unsatisfactory: number;
}

// Define interface for Analytics
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

// Conversation Schema
const ConversationSchema = new mongoose.Schema<IConversation>({
  sessionId: { type: String, required: true, index: true },
  userMessage: { type: String, required: true },
  botResponse: { type: String, required: true },
  topic: { type: String, default: 'general' },
  page: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
  needsReview: { type: Boolean, default: false },
  reviewReason: { type: String },
  helpful: { type: Boolean, default: null }
});

// Feedback Schema
const FeedbackSchema = new mongoose.Schema<IFeedback>({
  conversationId: { type: String, required: true, index: true },
  messageId: { type: String, required: true },
  helpful: { type: Boolean, required: true },
  comment: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// Query Analytics Schema
const QuerySchema = new mongoose.Schema<IQuery>({
  query: { type: String, required: true, unique: true },
  count: { type: Number, default: 1 },
  lastAsked: { type: Date, default: Date.now, index: true },
  topics: { type: [String], default: [] },
  satisfactory: { type: Number, default: 0 },
  unsatisfactory: { type: Number, default: 0 }
});

// Daily Analytics Schema
const AnalyticsSchema = new mongoose.Schema<IAnalytics>({
  date: { type: String, required: true, unique: true, index: true },
  totalConversations: { type: Number, default: 0 },
  totalMessages: { type: Number, default: 0 },
  uniqueUsers: { type: Number, default: 0 },
  topics: { type: Map, of: Number, default: {} },
  helpfulPercentage: { type: Number, default: 0 },
  topQueries: { type: [{
    query: String,
    count: Number
  }], default: [] },
  lastUpdated: { type: Date, default: Date.now }
});

// Export models with proper typing
export const Conversation: Model<IConversation> = 
  mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

export const Feedback: Model<IFeedback> = 
  mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export const Query: Model<IQuery> = 
  mongoose.models.Query || mongoose.model<IQuery>('Query', QuerySchema);

export const Analytics: Model<IAnalytics> = 
  mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);