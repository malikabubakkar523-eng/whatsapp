import 'message_model.dart';
import 'user_model.dart';

class ConversationModel {
  final String id;
  final bool isGroup;
  final String? name;
  final String? description;
  final String? avatar;
  final bool isArchived;
  final bool isPinned;
  final int unreadCount;
  final MessageModel? lastMessage;
  final DateTime? lastMessageAt;
  final UserModel? otherUser;
  final List<UserModel> members;

  ConversationModel({
    required this.id,
    this.isGroup = false,
    this.name,
    this.description,
    this.avatar,
    this.isArchived = false,
    this.isPinned = false,
    this.unreadCount = 0,
    this.lastMessage,
    this.lastMessageAt,
    this.otherUser,
    this.members = const [],
  });

  String get displayName {
    if (isGroup) return name ?? 'Group Chat';
    return otherUser?.profile.displayName ?? otherUser?.profile.username ?? 'Chat';
  }

  String? get displayAvatar {
    if (isGroup) return avatar;
    return otherUser?.profile.avatar;
  }

  bool get isOnline => !isGroup && (otherUser?.profile.isOnline ?? false);

  factory ConversationModel.fromJson(Map<String, dynamic> json, {String? currentUserId}) {
    UserModel? otherUser;
    if (json['otherUser'] != null) {
      otherUser = UserModel.fromJson(json['otherUser']);
    }

    MessageModel? lastMessage;
    if (json['lastMessage'] != null) {
      lastMessage = MessageModel.fromJson(json['lastMessage'], currentUserId: currentUserId);
    }

    return ConversationModel(
      id: json['id'] ?? '',
      isGroup: json['isGroup'] == true,
      name: json['name'],
      description: json['description'],
      avatar: json['avatar'],
      isArchived: json['isArchived'] == true,
      isPinned: json['isPinned'] == true,
      unreadCount: json['unreadCount'] ?? 0,
      lastMessage: lastMessage,
      lastMessageAt: json['lastMessageAt'] != null
          ? DateTime.tryParse(json['lastMessageAt'])
          : null,
      otherUser: otherUser,
      members: (json['members'] as List?)
              ?.map((m) => UserModel.fromJson(m['user'] ?? m))
              .toList() ??
          [],
    );
  }
}
