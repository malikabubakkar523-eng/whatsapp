import { MongoClient, Db, Collection } from "mongodb";
import {
  UserDoc,
  ChatDoc,
  MessageDoc,
  MessageReactionDoc,
  GroupDoc,
  GroupMemberDoc,
  StoryDoc,
  StoryViewDoc,
  CallDoc,
  NotificationDoc,
  ReportDoc,
} from "./models/mongodb-models";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/chatflow";
const DB_NAME = "chatflow";

// Global connection cache for serverless & Node.js hot-reloads
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let indexesInitialized = false;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 50,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 5000,
  });

  await client.connect();
  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;

  if (!indexesInitialized) {
    await initMongoIndexes(db);
    indexesInitialized = true;
  }

  return { client, db };
}

export async function getMongoDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

// Typed Collection Accessors
export async function getMongoCollections() {
  const db = await getMongoDb();
  return {
    users: db.collection<UserDoc>("users"),
    chats: db.collection<ChatDoc>("chats"),
    messages: db.collection<MessageDoc>("messages"),
    messageReactions: db.collection<MessageReactionDoc>("messageReactions"),
    groups: db.collection<GroupDoc>("groups"),
    groupMembers: db.collection<GroupMemberDoc>("groupMembers"),
    stories: db.collection<StoryDoc>("stories"),
    storyViews: db.collection<StoryViewDoc>("storyViews"),
    calls: db.collection<CallDoc>("calls"),
    notifications: db.collection<NotificationDoc>("notifications"),
    reports: db.collection<ReportDoc>("reports"),
  };
}

/**
 * Initialize all high-performance indexes as specified in the architecture prompt.
 */
export async function initMongoIndexes(db: Db): Promise<void> {
  try {
    const users = db.collection("users");
    const chats = db.collection("chats");
    const messages = db.collection("messages");
    const messageReactions = db.collection("messageReactions");
    const groupMembers = db.collection("groupMembers");
    const stories = db.collection("stories");
    const storyViews = db.collection("storyViews");
    const calls = db.collection("calls");
    const notifications = db.collection("notifications");
    const reports = db.collection("reports");

    // 1. Users Indexes
    await users.createIndex({ username: 1 }, { unique: true, name: "idx_users_username_unique" });
    await users.createIndex({ email: 1 }, { unique: true, name: "idx_users_email_unique" });
    await users.createIndex({ displayName: 1 }, { name: "idx_users_displayName" });

    // 2. Chats Indexes
    await chats.createIndex({ memberIds: 1, lastMessageAt: -1 }, { name: "idx_chats_members_lastMessage" });
    await chats.createIndex({ lastMessageAt: -1 }, { name: "idx_chats_lastMessageAt" });

    // 3. Messages Indexes (The most critical for 0ms fast chat opening & cursor pagination)
    await messages.createIndex({ chatId: 1, createdAt: -1 }, { name: "idx_messages_chatId_createdAt" });
    await messages.createIndex(
      { clientMessageId: 1 },
      { unique: true, sparse: true, name: "idx_messages_clientMessageId_unique" }
    );
    await messages.createIndex({ senderId: 1 }, { name: "idx_messages_senderId" });

    // 4. Message Reactions Index
    await messageReactions.createIndex(
      { messageId: 1, userId: 1, reaction: 1 },
      { unique: true, name: "idx_reactions_unique" }
    );

    // 5. Group Members Index
    await groupMembers.createIndex({ groupId: 1, userId: 1 }, { unique: true, name: "idx_group_member_unique" });

    // 6. Stories 24h Auto-Expiry TTL Index
    await stories.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "idx_stories_ttl" });
    await stories.createIndex({ userId: 1, createdAt: -1 }, { name: "idx_stories_user_created" });

    // 7. Story Views Index
    await storyViews.createIndex({ storyId: 1, userId: 1 }, { unique: true, name: "idx_story_views_unique" });

    // 8. Calls Index
    await calls.createIndex({ chatId: 1, startedAt: -1 }, { name: "idx_calls_chat_started" });
    await calls.createIndex({ callerId: 1, createdAt: -1 }, { name: "idx_calls_caller" });

    // 9. Notifications Index
    await notifications.createIndex({ userId: 1, read: 1, createdAt: -1 }, { name: "idx_notifications_user_read" });

    // 10. Reports Index
    await reports.createIndex({ status: 1, createdAt: -1 }, { name: "idx_reports_status" });

    console.log("✔ MongoDB Architecture Indexes successfully verified/created.");
  } catch (err: any) {
    console.warn("MongoDB Index initialization notice:", err?.message || err);
  }
}
