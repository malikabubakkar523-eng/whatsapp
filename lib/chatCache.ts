"use client";

import { MessageTypeData, ConversationType } from "@/types";

const DB_NAME = "ChatFlowLocalCache";
const DB_VERSION = 1;
const MESSAGES_STORE = "conversation_messages";
const CONVERSATIONS_STORE = "conversations_list";
const DRAFTS_STORE = "drafts";

let dbInstance: IDBDatabase | null = null;
let isOpening = false;
const openCallbacks: Array<(db: IDBDatabase | null) => void> = [];

/**
 * Open or retrieve IndexedDB database connection
 */
function getDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.resolve(null);
  }

  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (isOpening) {
    return new Promise((resolve) => {
      openCallbacks.push(resolve);
    });
  }

  isOpening = true;

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
          db.createObjectStore(MESSAGES_STORE, { keyPath: "conversationId" });
        }
        if (!db.objectStoreNames.contains(CONVERSATIONS_STORE)) {
          db.createObjectStore(CONVERSATIONS_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(DRAFTS_STORE)) {
          db.createObjectStore(DRAFTS_STORE, { keyPath: "conversationId" });
        }
      };

      request.onsuccess = (event) => {
        dbInstance = (event.target as IDBOpenDBRequest).result;
        isOpening = false;
        resolve(dbInstance);
        openCallbacks.forEach((cb) => cb(dbInstance));
        openCallbacks.length = 0;
      };

      request.onerror = () => {
        isOpening = false;
        resolve(null);
        openCallbacks.forEach((cb) => cb(null));
        openCallbacks.length = 0;
      };
    } catch {
      isOpening = false;
      resolve(null);
    }
  });
}

/**
 * In-memory fallback cache if IndexedDB is unavailable
 */
const memoryMessageCache = new Map<string, MessageTypeData[]>();
let memoryConversationsCache: ConversationType[] = [];
const memoryDrafts = new Map<string, string>();

// ============================================================================
// MESSAGE CACHE APIS (Cache-First)
// ============================================================================

/**
 * Instantly get cached messages for a conversation (0ms latency)
 */
export async function getCachedMessages(conversationId: string): Promise<MessageTypeData[]> {
  if (!conversationId) return [];

  // Check in-memory first
  if (memoryMessageCache.has(conversationId)) {
    return memoryMessageCache.get(conversationId) || [];
  }

  const db = await getDB();
  if (!db) {
    // Try localStorage fallback
    try {
      const raw = localStorage.getItem(`chatflow_msg_${conversationId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        memoryMessageCache.set(conversationId, parsed);
        return parsed;
      }
    } catch {}
    return [];
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(MESSAGES_STORE, "readonly");
      const store = transaction.objectStore(MESSAGES_STORE);
      const request = store.get(conversationId);

      request.onsuccess = () => {
        const result = request.result;
        if (result && Array.isArray(result.messages)) {
          memoryMessageCache.set(conversationId, result.messages);
          resolve(result.messages);
        } else {
          resolve([]);
        }
      };

      request.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

/**
 * Persist messages to local cache (Keeps up to last 100 messages per chat)
 */
export async function saveCachedMessages(conversationId: string, messages: MessageTypeData[]): Promise<void> {
  if (!conversationId || !Array.isArray(messages)) return;

  // Keep latest 100 messages in cache
  const trimmed = messages.slice(-100);
  memoryMessageCache.set(conversationId, trimmed);

  const db = await getDB();
  if (!db) {
    try {
      localStorage.setItem(`chatflow_msg_${conversationId}`, JSON.stringify(trimmed));
    } catch {}
    return;
  }

  try {
    const transaction = db.transaction(MESSAGES_STORE, "readwrite");
    const store = transaction.objectStore(MESSAGES_STORE);
    store.put({
      conversationId,
      messages: trimmed,
      updatedAt: Date.now(),
    });
  } catch {}
}

/**
 * Add or update a single message in the local cache
 */
export async function appendCachedMessage(conversationId: string, message: MessageTypeData): Promise<void> {
  if (!conversationId || !message) return;
  const current = await getCachedMessages(conversationId);
  const exists = current.some((m) => m.id === message.id);
  const updated = exists ? current.map((m) => (m.id === message.id ? message : m)) : [...current, message];
  await saveCachedMessages(conversationId, updated);
}

// ============================================================================
// CONVERSATIONS LIST CACHE APIS
// ============================================================================

/**
 * Instantly get cached conversations list
 */
export async function getCachedConversations(): Promise<ConversationType[]> {
  if (memoryConversationsCache.length > 0) {
    return memoryConversationsCache;
  }

  const db = await getDB();
  if (!db) {
    try {
      const raw = localStorage.getItem("chatflow_conversations_cache");
      if (raw) {
        const parsed = JSON.parse(raw);
        memoryConversationsCache = parsed;
        return parsed;
      }
    } catch {}
    return [];
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(CONVERSATIONS_STORE, "readonly");
      const store = transaction.objectStore(CONVERSATIONS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const result = request.result;
        if (Array.isArray(result) && result.length > 0) {
          memoryConversationsCache = result;
          resolve(result);
        } else {
          resolve([]);
        }
      };

      request.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

/**
 * Save conversations list to cache
 */
export async function saveCachedConversations(conversations: ConversationType[]): Promise<void> {
  if (!Array.isArray(conversations)) return;
  memoryConversationsCache = conversations;

  const db = await getDB();
  if (!db) {
    try {
      localStorage.setItem("chatflow_conversations_cache", JSON.stringify(conversations));
    } catch {}
    return;
  }

  try {
    const transaction = db.transaction(CONVERSATIONS_STORE, "readwrite");
    const store = transaction.objectStore(CONVERSATIONS_STORE);
    store.clear();
    conversations.forEach((conv) => store.put(conv));
  } catch {}
}

// ============================================================================
// DRAFT MESSAGE CACHE APIS
// ============================================================================

export function getCachedDraft(conversationId: string): string {
  if (!conversationId) return "";
  if (memoryDrafts.has(conversationId)) {
    return memoryDrafts.get(conversationId) || "";
  }
  try {
    return localStorage.getItem(`chatflow_draft_${conversationId}`) || "";
  } catch {
    return "";
  }
}

export function setCachedDraft(conversationId: string, text: string): void {
  if (!conversationId) return;
  if (!text) {
    memoryDrafts.delete(conversationId);
    try {
      localStorage.removeItem(`chatflow_draft_${conversationId}`);
    } catch {}
  } else {
    memoryDrafts.set(conversationId, text);
    try {
      localStorage.setItem(`chatflow_draft_${conversationId}`, text);
    } catch {}
  }
}
