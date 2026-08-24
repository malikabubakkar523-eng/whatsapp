import { ObjectId } from "mongodb";

// 1. Users Collection
export interface UserPrivacySettings {
  discoverability: "EVERYONE" | "RESTRICTED" | "NOBODY";
  onlineStatusPrivacy: "EVERYONE" | "CONTACTS" | "NOBODY";
  lastSeenPrivacy: "EVERYONE" | "CONTACTS" | "NOBODY";
  profilePicturePrivacy: "EVERYONE" | "CONTACTS" | "NOBODY";
  readReceiptsEnabled: boolean;
  typingIndicatorEnabled: boolean;
}

export interface UserNotificationSettings {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export interface UserDoc {
  _id?: ObjectId | string;
  username: string; // Unique, e.g. "emma_watson"
  email: string; // Unique
  passwordHash: string;
  displayName: string;
  avatar?: string | null;
  bio?: string | null;
  role: "USER" | "ADMIN";
  accountStatus: "ACTIVE" | "SUSPENDED" | "DELETED";
  lastSeen: Date;
  privacySettings: UserPrivacySettings;
  notificationSettings: UserNotificationSettings;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Chats Collection
export interface ChatDoc {
  _id?: ObjectId | string;
  type: "direct" | "group" | "saved";
  name?: string | null; // Group name or null for direct
  avatar?: string | null;
  description?: string | null;
  createdBy?: string | null; // User ID
  memberIds: string[]; // List of user IDs participating
  lastMessageId?: string | null;
  lastMessagePreview?: string | null;
  lastMessageAt: Date;
  lastMessageSenderId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// 3. Messages Collection
export interface MessageAttachment {
  id: string;
  url: string;
  fileName: string;
  fileType: string; // image/png, video/mp4, audio/webm, etc.
  fileSize: number;
  duration?: number | null;
  thumbnailUrl?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface MessageReactionDoc {
  _id?: ObjectId | string;
  messageId: string;
  userId: string;
  reaction: string; // emoji e.g. ❤️, 👍, 😂
  createdAt: Date;
}

export interface MessageDoc {
  _id?: ObjectId | string;
  clientMessageId?: string; // Idempotency key from Flutter/Web client
  chatId: string; // Chat / Conversation ID
  senderId: string; // User ID
  type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "CALL";
  text: string;
  attachments?: MessageAttachment[];
  replyTo?: {
    messageId: string;
    senderDisplayName: string;
    textPreview: string;
  } | null;
  reactions?: Array<{ emoji: string; userId: string; createdAt: Date }>;
  mentions?: string[]; // Array of mentioned usernames/userIds
  status: "SENDING" | "SENT" | "DELIVERED" | "READ";
  pinned: boolean;
  viewOnce: boolean;
  viewOnceOpened?: boolean;
  deletedAt?: Date | null;
  deletedFor?: string[]; // User IDs who deleted for themselves
  deletedForEveryone?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 4. Groups & Group Members Collection
export interface GroupDoc {
  _id?: ObjectId | string;
  name: string;
  description?: string | null;
  avatar?: string | null;
  ownerId: string;
  adminIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMemberDoc {
  _id?: ObjectId | string;
  groupId: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: Date;
  muted: boolean;
  lastReadMessageId?: string | null;
}

// 5. Stories & Story Views Collection
export interface StoryDoc {
  _id?: ObjectId | string;
  userId: string;
  type: "TEXT" | "IMAGE" | "VIDEO";
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  caption?: string | null;
  background?: string | null; // Gradient hex or color
  fontStyle?: string | null;
  expiresAt: Date; // TTL Index field (24 hours after creation)
  createdAt: Date;
}

export interface StoryViewDoc {
  _id?: ObjectId | string;
  storyId: string;
  userId: string;
  viewedAt: Date;
}

// 6. Calls Collection
export interface CallDoc {
  _id?: ObjectId | string;
  callerId: string;
  receiverId: string;
  chatId: string;
  type: "VOICE" | "VIDEO";
  status: "INCOMING" | "OUTGOING" | "MISSED" | "COMPLETED" | "REJECTED";
  startedAt: Date;
  endedAt?: Date | null;
  duration: number; // in seconds
  createdAt: Date;
}

// 7. Notifications Collection
export interface NotificationDoc {
  _id?: ObjectId | string;
  userId: string;
  type: "MESSAGE" | "MENTION" | "REACTION" | "GROUP_INVITE" | "LOGIN" | "SECURITY" | "CALL";
  title: string;
  body: string;
  relatedId?: string | null; // e.g. chatId or messageId
  read: boolean;
  createdAt: Date;
}

// 8. Reports Collection
export interface ReportDoc {
  _id?: ObjectId | string;
  reporterId: string;
  reportedUserId?: string | null;
  messageId?: string | null;
  chatId?: string | null;
  reason: "SPAM" | "HARASSMENT" | "FAKE_ACCOUNT" | "INAPPROPRIATE" | "OTHER";
  status: "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED";
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  createdAt: Date;
}
