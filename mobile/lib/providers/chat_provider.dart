import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/constants/api_endpoints.dart';
import '../models/conversation_model.dart';
import '../models/message_model.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';

class ChatProvider extends ChangeNotifier {
  List<ConversationModel> _conversations = [];
  final Map<String, List<MessageModel>> _messages = {};
  bool _isLoadingConversations = false;
  bool _isLoadingMessages = false;
  String _activeFilter = 'All'; // All, Unread, Groups, Archived
  final Map<String, bool> _typingUsers = {}; // conversationId -> isTyping
  int _unreadVisitorsCount = 0;
  String? _currentlyOpenConversationId;

  List<ConversationModel> get conversations {
    List<ConversationModel> filtered;
    if (_activeFilter == 'Unread') {
      filtered = _conversations.where((c) => c.unreadCount > 0 && !c.isArchived).toList();
    } else if (_activeFilter == 'Groups') {
      filtered = _conversations.where((c) => c.isGroup && !c.isArchived).toList();
    } else if (_activeFilter == 'Archived') {
      filtered = _conversations.where((c) => c.isArchived).toList();
    } else {
      filtered = _conversations.where((c) => !c.isArchived).toList();
    }

    // Sort by lastMessageAt descending (latest on top)
    filtered.sort((a, b) => b.lastMessageAt.compareTo(a.lastMessageAt));
    return filtered;
  }

  bool get isLoadingConversations => _isLoadingConversations;
  bool get isLoadingMessages => _isLoadingMessages;
  String get activeFilter => _activeFilter;
  int get unreadVisitorsCount => _unreadVisitorsCount;

  void setFilter(String filter) {
    _activeFilter = filter;
    notifyListeners();
  }

  void setCurrentlyOpenConversation(String? id) {
    _currentlyOpenConversationId = id;
    if (id != null) {
      // Mark as read in local conversation list
      final idx = _conversations.indexWhere((c) => c.id == id);
      if (idx != -1) {
        final c = _conversations[idx];
        _conversations[idx] = ConversationModel(
          id: c.id,
          isGroup: c.isGroup,
          name: c.name,
          description: c.description,
          avatar: c.avatar,
          isArchived: c.isArchived,
          isPinned: c.isPinned,
          unreadCount: 0,
          lastMessage: c.lastMessage,
          lastMessageAt: c.lastMessageAt,
          members: c.members,
          otherUser: c.otherUser,
        );
        notifyListeners();
      }
    }
  }

  void resetVisitorCount() {
    _unreadVisitorsCount = 0;
    notifyListeners();
  }

  List<MessageModel> getMessages(String conversationId) {
    final list = _messages[conversationId] ?? [];
    // Ensure chronological order
    list.sort((a, b) => a.createdAt.compareTo(b.createdAt));
    return list;
  }

  bool isUserTyping(String conversationId) {
    return _typingUsers[conversationId] == true;
  }

  void initSocketListeners(String currentUserId) {
    SocketService.initSocket(
      onNewMessage: (data) {
        final rawMsg = data['message'] ?? data;
        if (rawMsg != null && rawMsg is Map<String, dynamic>) {
          final msg = MessageModel.fromJson(rawMsg, currentUserId: currentUserId);
          addIncomingMessage(msg);
        }
      },
      onMessageStatusUpdate: (data) {
        final messageId = data['messageId'];
        final conversationId = data['conversationId'];
        final statusStr = data['status'];

        if (conversationId != null && messageId != null && statusStr != null) {
          final list = _messages[conversationId];
          if (list != null) {
            MessageStatus status = MessageStatus.SENT;
            if (statusStr == 'DELIVERED') status = MessageStatus.DELIVERED;
            if (statusStr == 'READ') status = MessageStatus.READ;

            final idx = list.indexWhere((m) => m.id == messageId || m.clientMessageId == messageId);
            if (idx != -1) {
              final old = list[idx];
              list[idx] = MessageModel(
                id: old.id,
                conversationId: old.conversationId,
                senderId: old.senderId,
                senderName: old.senderName,
                senderAvatar: old.senderAvatar,
                content: old.content,
                type: old.type,
                mediaUrl: old.mediaUrl,
                fileName: old.fileName,
                fileSize: old.fileSize,
                duration: old.duration,
                isMine: old.isMine,
                status: status,
                isViewOnce: old.isViewOnce,
                viewOnceOpened: old.viewOnceOpened,
                isPinned: old.isPinned,
                isDeleted: old.isDeleted,
                replyToMessage: old.replyToMessage,
                reactions: old.reactions,
                createdAt: old.createdAt,
                clientMessageId: old.clientMessageId,
              );
              notifyListeners();
            }
          }
        }
      },
      onUserStatus: (data) {
        final userId = data['userId'];
        final isOnline = data['isOnline'] == true;
        if (userId != null) {
          bool updated = false;
          _conversations = _conversations.map((c) {
            if (!c.isGroup && c.otherUser?.id == userId) {
              updated = true;
              return ConversationModel(
                id: c.id,
                isGroup: c.isGroup,
                name: c.name,
                description: c.description,
                avatar: c.avatar,
                isArchived: c.isArchived,
                isPinned: c.isPinned,
                unreadCount: c.unreadCount,
                lastMessage: c.lastMessage,
                lastMessageAt: c.lastMessageAt,
                members: c.members,
                otherUser: c.otherUser != null
                    ? c.otherUser!.copyWith(isOnline: isOnline)
                    : null,
              );
            }
            return c;
          }).toList();
          if (updated) notifyListeners();
        }
      },
      onTypingStart: (data) {
        final convId = data['conversationId'];
        if (convId != null) {
          _typingUsers[convId] = true;
          notifyListeners();
        }
      },
      onTypingStop: (data) {
        final convId = data['conversationId'];
        if (convId != null) {
          _typingUsers[convId] = false;
          notifyListeners();
        }
      },
      onIncomingCall: (data) {},
      onProfileVisitor: (data) {
        _unreadVisitorsCount += 1;
        notifyListeners();
      },
    );
  }

  Future<void> fetchConversations(String currentUserId) async {
    _isLoadingConversations = true;
    notifyListeners();

    try {
      final res = await ApiService.get(ApiEndpoints.conversations);
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['conversations'] is List) {
          _conversations = (data['conversations'] as List)
              .map((c) => ConversationModel.fromJson(c, currentUserId: currentUserId))
              .toList();
        }
      }
    } catch (e) {
      print('Fetch conversations error: $e');
    } finally {
      _isLoadingConversations = false;
      notifyListeners();
    }
  }

  Future<void> fetchMessages(String conversationId, String currentUserId) async {
    // Only set loading if no cached messages exist
    if (!_messages.containsKey(conversationId) || _messages[conversationId]!.isEmpty) {
      _isLoadingMessages = true;
      notifyListeners();
    }

    SocketService.joinConversation(conversationId);

    try {
      final res = await ApiService.get(ApiEndpoints.messages(conversationId));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['messages'] is List) {
          final fetched = (data['messages'] as List)
              .map((m) => MessageModel.fromJson(m, currentUserId: currentUserId))
              .toList();

          _messages[conversationId] = fetched;
        }
      }
    } catch (e) {
      print('Fetch messages error: $e');
    } finally {
      _isLoadingMessages = false;
      notifyListeners();
    }
  }

  void addIncomingMessage(MessageModel msg) {
    final list = _messages[msg.conversationId] ?? [];
    // Prevent duplicate entries
    if (!list.any((m) => m.id == msg.id || (msg.clientMessageId != null && m.clientMessageId == msg.clientMessageId))) {
      _messages[msg.conversationId] = [...list, msg];
    }

    // Update conversation in list (last message & unread badge)
    final idx = _conversations.indexWhere((c) => c.id == msg.conversationId);
    final isCurrentChat = _currentlyOpenConversationId == msg.conversationId;

    if (idx != -1) {
      final old = _conversations[idx];
      final newUnread = (msg.isMine || isCurrentChat) ? old.unreadCount : old.unreadCount + 1;

      _conversations[idx] = ConversationModel(
        id: old.id,
        isGroup: old.isGroup,
        name: old.name,
        description: old.description,
        avatar: old.avatar,
        isArchived: old.isArchived,
        isPinned: old.isPinned,
        unreadCount: newUnread,
        lastMessage: msg.content.isNotEmpty ? msg.content : '[Attachment]',
        lastMessageAt: msg.createdAt,
        members: old.members,
        otherUser: old.otherUser,
      );
    }
    notifyListeners();
  }

  Future<void> sendMessage({
    required String conversationId,
    required String content,
    required String currentUserId,
    MessageType type = MessageType.TEXT,
  }) async {
    final clientMessageId = 'cmsg_${DateTime.now().millisecondsSinceEpoch}';
    final optimisticMsg = MessageModel(
      id: clientMessageId,
      conversationId: conversationId,
      senderId: currentUserId,
      content: content,
      type: type,
      isMine: true,
      status: MessageStatus.SENT,
      createdAt: DateTime.now(),
      clientMessageId: clientMessageId,
    );

    // Optimistic UI update
    final currentList = _messages[conversationId] ?? [];
    _messages[conversationId] = [...currentList, optimisticMsg];

    // Update conversation list preview immediately
    final idx = _conversations.indexWhere((c) => c.id == conversationId);
    if (idx != -1) {
      final old = _conversations[idx];
      _conversations[idx] = ConversationModel(
        id: old.id,
        isGroup: old.isGroup,
        name: old.name,
        description: old.description,
        avatar: old.avatar,
        isArchived: old.isArchived,
        isPinned: old.isPinned,
        unreadCount: old.unreadCount,
        lastMessage: content.isNotEmpty ? content : '[Attachment]',
        lastMessageAt: DateTime.now(),
        members: old.members,
        otherUser: old.otherUser,
      );
    }
    notifyListeners();

    try {
      final res = await ApiService.post(ApiEndpoints.messages(conversationId), {
        'content': content,
        'type': type.name,
        'clientMessageId': clientMessageId,
      });

      if (res.statusCode == 200 || res.statusCode == 201) {
        final data = jsonDecode(res.body);
        if (data['message'] != null) {
          final confirmed = MessageModel.fromJson(data['message'], currentUserId: currentUserId);
          final list = _messages[conversationId] ?? [];
          _messages[conversationId] = list
              .map((m) => (m.id == clientMessageId || m.clientMessageId == clientMessageId) ? confirmed : m)
              .toList();
          notifyListeners();
        }
      }
    } catch (e) {
      print('Send message error: $e');
    }
  }
}
