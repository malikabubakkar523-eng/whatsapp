enum MessageType { TEXT, IMAGE, VIDEO, AUDIO, DOCUMENT, CALL }
enum MessageStatus { SENDING, SENT, DELIVERED, READ }

class MessageModel {
  final String id;
  final String conversationId;
  final String senderId;
  final String content;
  final MessageType type;
  final bool isMine;
  final MessageStatus status;
  final bool isViewOnce;
  final bool viewOnceOpened;
  final String? replyToId;
  final bool isPinned;
  final bool isDeleted;
  final DateTime createdAt;
  final List<AttachmentModel> attachments;
  final List<ReactionModel> reactions;
  final String? clientMessageId;
  final String? senderDisplayName;
  final String? senderUsername;
  final String? senderAvatar;

  MessageModel({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.content,
    this.type = MessageType.TEXT,
    this.isMine = false,
    this.status = MessageStatus.SENT,
    this.isViewOnce = false,
    this.viewOnceOpened = false,
    this.replyToId,
    this.isPinned = false,
    this.isDeleted = false,
    required this.createdAt,
    this.attachments = const [],
    this.reactions = const [],
    this.clientMessageId,
    this.senderDisplayName,
    this.senderUsername,
    this.senderAvatar,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json, {String? currentUserId}) {
    final senderId = json['senderId'] ?? '';
    final isMine = json['isMine'] ?? (currentUserId != null && senderId == currentUserId);

    final statusStr = json['status']?.toString().toUpperCase() ?? 'SENT';
    MessageStatus status = MessageStatus.SENT;
    if (statusStr == 'DELIVERED') status = MessageStatus.DELIVERED;
    if (statusStr == 'READ') status = MessageStatus.READ;
    if (statusStr == 'SENDING') status = MessageStatus.SENDING;

    final typeStr = json['type']?.toString().toUpperCase() ?? 'TEXT';
    MessageType type = MessageType.TEXT;
    if (typeStr == 'IMAGE') type = MessageType.IMAGE;
    if (typeStr == 'VIDEO') type = MessageType.VIDEO;
    if (typeStr == 'AUDIO') type = MessageType.AUDIO;
    if (typeStr == 'DOCUMENT') type = MessageType.DOCUMENT;
    if (typeStr == 'CALL') type = MessageType.CALL;

    final senderProfile = json['sender']?['profile'];

    return MessageModel(
      id: json['id'] ?? '',
      conversationId: json['conversationId'] ?? '',
      senderId: senderId,
      content: json['content'] ?? '',
      type: type,
      isMine: isMine,
      status: status,
      isViewOnce: json['isViewOnce'] == true,
      viewOnceOpened: json['viewOnceOpened'] == true,
      replyToId: json['replyToId'],
      isPinned: json['isPinned'] == true,
      isDeleted: json['isDeleted'] == true || json['deletedForEveryone'] == true,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
      attachments: (json['attachments'] as List?)
              ?.map((a) => AttachmentModel.fromJson(a))
              .toList() ??
          [],
      reactions: (json['reactions'] as List?)
              ?.map((r) => ReactionModel.fromJson(r))
              .toList() ??
          [],
      clientMessageId: json['clientMessageId'],
      senderDisplayName: senderProfile?['displayName'],
      senderUsername: senderProfile?['username'],
      senderAvatar: senderProfile?['avatar'],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'conversationId': conversationId,
        'senderId': senderId,
        'content': content,
        'type': type.name,
        'isMine': isMine,
        'status': status.name,
        'isViewOnce': isViewOnce,
        'viewOnceOpened': viewOnceOpened,
        'replyToId': replyToId,
        'isPinned': isPinned,
        'isDeleted': isDeleted,
        'createdAt': createdAt.toIso8601String(),
        'attachments': attachments.map((a) => a.toJson()).toList(),
        'reactions': reactions.map((r) => r.toJson()).toList(),
        'clientMessageId': clientMessageId,
      };
}

class AttachmentModel {
  final String id;
  final String url;
  final String fileName;
  final String fileType;
  final int fileSize;
  final int? duration;

  AttachmentModel({
    required this.id,
    required this.url,
    required this.fileName,
    required this.fileType,
    required this.fileSize,
    this.duration,
  });

  factory AttachmentModel.fromJson(Map<String, dynamic> json) {
    return AttachmentModel(
      id: json['id'] ?? '',
      url: json['url'] ?? '',
      fileName: json['fileName'] ?? 'file',
      fileType: json['fileType'] ?? 'file',
      fileSize: json['fileSize'] ?? 0,
      duration: json['duration'],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'url': url,
        'fileName': fileName,
        'fileType': fileType,
        'fileSize': fileSize,
        'duration': duration,
      };
}

class ReactionModel {
  final String id;
  final String emoji;
  final String userId;

  ReactionModel({
    required this.id,
    required this.emoji,
    required this.userId,
  });

  factory ReactionModel.fromJson(Map<String, dynamic> json) {
    return ReactionModel(
      id: json['id'] ?? '',
      emoji: json['emoji'] ?? '',
      userId: json['userId'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'emoji': emoji,
        'userId': userId,
      };
}
