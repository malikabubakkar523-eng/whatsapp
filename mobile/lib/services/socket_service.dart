import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../core/constants/api_endpoints.dart';
import 'storage_service.dart';

class SocketService {
  static IO.Socket? _socket;
  static bool get isConnected => _socket?.connected ?? false;

  static Future<void> initSocket({
    required Function(Map<String, dynamic>) onNewMessage,
    required Function(Map<String, dynamic>) onMessageStatusUpdate,
    required Function(Map<String, dynamic>) onUserStatus,
    required Function(Map<String, dynamic>) onTypingStart,
    required Function(Map<String, dynamic>) onTypingStop,
    required Function(Map<String, dynamic>) onIncomingCall,
    required Function(Map<String, dynamic>) onProfileVisitor,
  }) async {
    final token = await StorageService.getToken();

    if (_socket != null && _socket!.connected) {
      if (token != null) {
        _socket!.emit('auth:identify', {'token': token});
      }
      return;
    }

    _socket = IO.io(
      ApiEndpoints.socketUrl,
      IO.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .enableAutoConnect()
          .enableReconnection()
          .setReconnectionDelay(1000)
          .setReconnectionAttempts(9999)
          .setAuth({'token': token})
          .build(),
    );

    _socket!.onConnect((_) {
      print('Flutter Socket connected: ${_socket!.id}');
      if (token != null) {
        _socket!.emit('auth:identify', {'token': token});
      }
    });

    _socket!.on('message:new', (data) {
      if (data is Map<String, dynamic>) {
        onNewMessage(data);
      }
    });

    _socket!.on('message:status_update', (data) {
      if (data is Map<String, dynamic>) {
        onMessageStatusUpdate(data);
      }
    });

    _socket!.on('user:status', (data) {
      if (data is Map<String, dynamic>) {
        onUserStatus(data);
      }
    });

    _socket!.on('typing:start', (data) {
      if (data is Map<String, dynamic>) {
        onTypingStart(data);
      }
    });

    _socket!.on('typing:stop', (data) {
      if (data is Map<String, dynamic>) {
        onTypingStop(data);
      }
    });

    _socket!.on('call:incoming', (data) {
      if (data is Map<String, dynamic>) {
        onIncomingCall(data);
      }
    });

    _socket!.on('call:invite', (data) {
      if (data is Map<String, dynamic>) {
        onIncomingCall(data);
      }
    });

    _socket!.on('profile:visitor_new', (data) {
      if (data is Map<String, dynamic>) {
        onProfileVisitor(data);
      }
    });

    _socket!.onDisconnect((_) => print('Flutter Socket disconnected'));
  }

  static void joinConversation(String conversationId) {
    _socket?.emit('conversation:join', {'conversationId': conversationId});
  }

  static void leaveConversation(String conversationId) {
    _socket?.emit('conversation:leave', {'conversationId': conversationId});
  }

  static void emitTyping(String conversationId, bool isTyping) {
    if (isTyping) {
      _socket?.emit('typing:start', {'conversationId': conversationId});
    } else {
      _socket?.emit('typing:stop', {'conversationId': conversationId});
    }
  }

  static void emitProfileVisit(String targetUserId, Map<String, dynamic> visitor) {
    _socket?.emit('profile:visit', {
      'targetUserId': targetUserId,
      'visitor': visitor,
    });
  }

  static void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }
}
