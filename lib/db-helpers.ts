// lib/db-helpers.ts
import dbConnect from './db';
import { Conversation, Feedback, Query, Analytics } from './schemas';

// Save conversation to database
export async function saveConversation(data: {
  sessionId: string;
  userMessage: string;
  botResponse: string;
  topic?: string;
  page?: string;
}) {
  await dbConnect();
  
  try {
    const conversation = new Conversation({
      ...data,
      timestamp: new Date()
    });
    await conversation.save();

    // Update query analytics
    await Query.updateOne(
      { query: data.userMessage.toLowerCase().trim() },
      {
        $inc: { count: 1 },
        $set: { lastAsked: new Date() },
        $addToSet: { topics: data.topic || 'general' }
      },
      { upsert: true }
    );

    // Update daily analytics
    const today = new Date().toISOString().split('T')[0];
    await Analytics.updateOne(
      { date: today },
      {
        $inc: { 
          totalConversations: 1,
          totalMessages: 1,
          [`topics.${data.topic || 'other'}`]: 1 
        },
        $set: { lastUpdated: new Date() }
      },
      { upsert: true }
    );

    return conversation;
  } catch (error) {
    console.error('Error saving conversation:', error);
    // Don't throw - logging fail ho to chat continue kare
  }
}

// Save user feedback
export async function saveFeedback(data: {
  conversationId: string;
  messageId: string;
  helpful: boolean;
  comment?: string;
}) {
  await dbConnect();
  
  try {
    const feedback = new Feedback({
      ...data,
      timestamp: new Date()
    });
    await feedback.save();

    // Update conversation with feedback
    await Conversation.updateOne(
      { sessionId: data.conversationId },
      { 
        $set: { 
          helpful: data.helpful,
          needsReview: !data.helpful,
          reviewReason: data.comment 
        } 
      }
    );

    // Update query satisfaction stats
    const conversation = await Conversation.findOne({ sessionId: data.conversationId });
    if (conversation) {
      await Query.updateOne(
        { query: conversation.userMessage.toLowerCase().trim() },
        {
          $inc: data.helpful ? { satisfactory: 1 } : { unsatisfactory: 1 }
        }
      );
    }

    return feedback;
  } catch (error) {
    console.error('Error saving feedback:', error);
  }
}

// Get analytics for dashboard
export async function getAnalytics(days: number = 7) {
  await dbConnect();
  
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalConversations, needsReview, topQueries, dailyStats] = await Promise.all([
      Conversation.countDocuments({ timestamp: { $gte: startDate } }),
      Conversation.countDocuments({ needsReview: true, timestamp: { $gte: startDate } }),
      Query.aggregate([
        { $match: { lastAsked: { $gte: startDate } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { query: 1, count: 1, satisfactory: 1, unsatisfactory: 1 } }
      ]),
      Analytics.find({ date: { $gte: startDate.toISOString().split('T')[0] } }).sort({ date: -1 })
    ]);

    // Calculate success rate
    const totalFeedbacks = await Feedback.countDocuments({ timestamp: { $gte: startDate } });
    const helpfulFeedbacks = await Feedback.countDocuments({ 
      helpful: true, 
      timestamp: { $gte: startDate } 
    });
    const successRate = totalFeedbacks > 0 
      ? Math.round((helpfulFeedbacks / totalFeedbacks) * 100) 
      : 0;

    return {
      totalConversations,
      needsReview,
      successRate,
      topQueries: topQueries.map(q => ({
        query: q.query,
        count: q.count,
        satisfaction: q.satisfactory + q.unsatisfactory > 0 
          ? Math.round((q.satisfactory / (q.satisfactory + q.unsatisfactory)) * 100)
          : 0
      })),
      dailyStats,
      period: `${days} days`
    };
  } catch (error) {
    console.error('Error getting analytics:', error);
    throw error;
  }
}

// Track unique users per day
export async function trackUser(sessionId: string) {
  await dbConnect();
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const exists = await Conversation.findOne({ 
      sessionId, 
      timestamp: { 
        $gte: new Date(today), 
        $lt: new Date(today + 'T23:59:59.999Z') 
      } 
    });

    if (!exists) {
      await Analytics.updateOne(
        { date: today },
        { $inc: { uniqueUsers: 1 } },
        { upsert: true }
      );
    }
  } catch (error) {
    console.error('Error tracking user:', error);
  }
}