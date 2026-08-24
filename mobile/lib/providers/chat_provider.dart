import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/constants/api_endpoints.dart';
import '../models/conversation_model.dart';
import '../models/message_model.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';

class ChatProvider extends ChangeNotifier {
  List<ConversationModel> _conversations = [];
  Map<String, List<MessageModel>> _messages = {};
  bool _isLoadingConversations = false;
  bool _isLoadingMessages = false;
  String _activeFilter = 'All'; // All, Unread, Groups, Archived
  Map<String, bool> _typingUsers = {}; // conversationId -> isTyping

  List<ConversationModel> get conversations {
    if (_activeFilter == 'Unread') {
      return _conversations.where((c) => c.unreadCount > 0 && !c.isArchived).toList();
    } else if (_activeFilter == 'Groups') {
      return _conversations.where((c) => c.isGroup && !c.isArchived).toList();
    } else if (_activeFilter == 'Archived') {
      return _conversations.where((c) => c.isArchived).toList();
    }
    return _conversations.where((c) => !c.isArchived).toList();
  }

  bool get isLoadingConversations => _isLoadingConversations;
  bool get isLoadingMessages => _isLoadingMessages;
  String get activeFilter => _activeFilter;

  void setFilter(String filter) {
    _activeFilter = filter;
    notifyListeners();
  }

  List<MessageModel> getMessages(String conversationId) {
    return _messages[conversationId] ?? [];
  }

  bool isUserTyping(String conversationId) {
    return _typingUsers[conversationId] == true;
  }

  void initSocketListeners(String currentUserId) {
    SocketService.initSocket(
      onNewMessage: (data) {
        if (data['message'] != null) {
          final msg = MessageModel.fromJson(data['message'], currentUserId: currentUserId);
          addIncomingMessage(msg);
        }
      },
      onUserStatus: (data) {
        final userId = data['userId'];
        final isOnline = data['isOnline'] == true;
        if (userId != null) {
          _conversations = _conversations.map((c) {
            if (!c.isGroup && c.otherUser?.id == userId) {
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
                otherUser: c.otherUser,
              );
            }
            return c;
          }).toList();
          notifyListeners();
        }
      },
      onTyping: (data) {
        final convId = data['conversationId'];
        if (convId != null) {
          _typingUsers[convId] = true;
          notifyListeners();
          Future.delayed(const Duration(seconds: 3), () {
            _typingUsers[convId] = false;
            notifyListeners();
          });
        }
      },
      onIncomingCall: (data) {},
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
    _isLoadingMessages = true;
    notifyListeners();

    SocketService.joinConversation(conversationId);

    try {
      final res = await ApiService.get(ApiEndpoints.messages(conversationId));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['messages'] is List) {
          _messages[conversationId] = (data['messages'] as List)
              .map((m) => MessageModel.fromJson(m, currentUserId: currentUserId))
              .toList();
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
    if (!list.any((m) => m.id == msg.id)) {
      _messages[msg.conversationId] = [...list, msg];
      notifyListeners();
    }
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
          _messages[conversationId] = _messages[conversationId]!
              .map((m) => m.id == clientMessageId ? confirmed : m)
              .toList();
          notifyListeners();
        }
      }
    } catch (e) {
      print('Send message error: $e');
    }
  }
}
