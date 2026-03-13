// lib/schemas.ts
import mongoose from 'mongoose';

// Conversation Schema - Har chat ko save karega
const ConversationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  userMessage: { type: String, required: true },
  botResponse: { type: String, required: true },
  topic: { type: String, default: 'general' },
  page: { type: String },
  timestamp: { type: Date, default: Date.now },
  needsReview: { type: Boolean, default: false },
  reviewReason: { type: String },
  helpful: { type: Boolean, default: null } // User feedback
});

// Feedback Schema - User ratings store karega
const FeedbackSchema = new mongoose.Schema({
  conversationId: { type: String, required: true },
  messageId: { type: String, required: true },
  helpful: { type: Boolean, required: true },
  comment: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// Query Analytics Schema - Frequent queries track karega
const QuerySchema = new mongoose.Schema({
  query: { type: String, required: true, unique: true },
  count: { type: Number, default: 1 },
  lastAsked: { type: Date, default: Date.now },
  topics: [String],
  satisfactory: { type: Number, default: 0 }, // % of helpful responses
  unsatisfactory: { type: Number, default: 0 }
});

// Knowledge Base Schema - Tom ka "brain" (future use)
const KnowledgeBaseSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String },
  frequency: { type: Number, default: 1 },
  lastUsed: { type: Date, default: Date.now },
  helpfulCount: { type: Number, default: 0 },
  notHelpfulCount: { type: Number, default: 0 }
});

// Daily Analytics Schema
const AnalyticsSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  totalConversations: { type: Number, default: 0 },
  totalMessages: { type: Number, default: 0 },
  uniqueUsers: { type: Number, default: 0 },
  topics: { type: Map, of: Number, default: {} },
  helpfulPercentage: { type: Number, default: 0 },
  topQueries: [{
    query: String,
    count: Number
  }],
  lastUpdated: { type: Date, default: Date.now }
});

// Models (prevent overwriting in development)
export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
export const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
export const Query = mongoose.models.Query || mongoose.model('Query', QuerySchema);
export const KnowledgeBase = mongoose.models.KnowledgeBase || mongoose.model('KnowledgeBase', KnowledgeBaseSchema);
export const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);