export type UserRole = "USER" | "ADMIN";

export interface UserProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  isOnline: boolean;
  lastSeen: string | Date;
  createdAt: string | Date;
  email?: string;
  role?: UserRole;
  isSuspended?: boolean;
}

export interface UserSettingsType {
  id: string;
  userId: string;
  discoverability: "EVERYONE" | "RESTRICTED" | "NOBODY";
  onlineStatusPrivacy: "EVERYONE" | "CONTACTS" | "NOBODY";
  lastSeenPrivacy: "EVERYONE" | "CONTACTS" | "NOBODY";
  profilePicturePrivacy: "EVERYONE" | "CONTACTS" | "NOBODY";
  readReceiptsEnabled: boolean;
  typingIndicatorEnabled: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  theme: "light" | "dark" | "system";
}

export type MessageType = "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE" | "CALL";
export type MessageStatus = "SENDING" | "SENT" | "DELIVERED" | "READ";

export interface AttachmentType {
  id: string;
  messageId: string;
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  duration?: number | null;
}

export interface MessageReactionType {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  user?: {
    id: string;
    profile?: {
      displayName: string;
      username: string;
    } | null;
  };
}

export interface MessageTypeData {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: {
    id: string;
    email?: string;
    profile: {
      username: string;
      displayName: string;
      avatar: string | null;
      isOnline?: boolean;
    } | null;
  };
  content: string;
  type: MessageType;
  replyToId?: string | null;
  replyTo?: {
    id: string;
    senderId: string;
    content: string;
    type: MessageType;
    sender?: {
      profile: {
        displayName: string;
        username: string;
      } | null;
    };
  } | null;
  isPinned: boolean;
  isViewOnce?: boolean;
  viewOnceOpened?: boolean;
  isDeleted: boolean;
  deletedForEveryone: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  attachments: AttachmentType[];
  reactions: MessageReactionType[];
  status?: MessageStatus;
  isMine?: boolean;
}

export interface ConversationMemberType {
  id: string;
  conversationId: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: string | Date;
  lastReadAt: string | Date;
  isMuted: boolean;
  user: {
    id: string;
    email?: string;
    profile: {
      username: string;
      displayName: string;
      avatar: string | null;
      bio: string | null;
      isOnline: boolean;
      lastSeen: string | Date;
    } | null;
  };
}

export interface ConversationType {
  id: string;
  isGroup: boolean;
  isSelf?: boolean;
  name: string | null;
  avatar: string | null;
  description: string | null;
  ownerId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  lastMessageAt: string | Date;
  members: ConversationMemberType[];
  lastMessage?: MessageTypeData | null;
  unreadCount?: number;
  otherUser?: {
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
    bio: string | null;
    isOnline: boolean;
    lastSeen: string | Date;
  } | null;
}

export interface CallLogType {
  id: string;
  conversationId: string;
  callerId: string;
  receiverId?: string;
  callType: "VOICE" | "VIDEO";
  status: "OUTGOING" | "INCOMING" | "MISSED" | "COMPLETED";
  durationSeconds?: number;
  createdAt: string | Date;
  contact?: {
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
    isOnline: boolean;
  } | null;
}

export interface NotificationType {
  id: string;
  userId: string;
  actorId?: string | null;
  actor?: {
    profile?: {
      displayName: string;
      username: string;
      avatar: string | null;
    } | null;
  } | null;
  type: "MESSAGE" | "MENTION" | "REACTION" | "GROUP_INVITE" | "LOGIN" | "SECURITY";
  title: string;
  content: string;
  isRead: boolean;
  dataJson?: string | null;
  createdAt: string | Date;
}

export interface StatusViewType {
  id: string;
  statusId: string;
  userId: string;
  user: {
    id: string;
    profile: {
      username: string;
      displayName: string;
      avatar: string | null;
    } | null;
  };
  viewedAt: string | Date;
}

export interface StatusLikeType {
  id: string;
  statusId: string;
  userId: string;
  user: {
    id: string;
    profile: {
      username: string;
      displayName: string;
      avatar: string | null;
    } | null;
  };
  createdAt: string | Date;
}

export interface UserStatusType {
  id: string;
  userId: string;
  user: {
    id: string;
    profile: {
      username: string;
      displayName: string;
      avatar: string | null;
      isOnline: boolean;
    } | null;
  };
  type: "TEXT" | "IMAGE" | "VIDEO";
  content?: string | null;
  mediaUrl?: string | null;
  bgColor?: string | null;
  fontStyle?: string | null;
  createdAt: string | Date;
  expiresAt: string | Date;
  views: StatusViewType[];
  likes: StatusLikeType[];
  isViewedByMe?: boolean;
  isLikedByMe?: boolean;
}

