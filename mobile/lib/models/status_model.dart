class StatusModel {
  final String id;
  final String userId;
  final String userName;
  final String? userAvatar;
  final String? mediaUrl;
  final String? textContent;
  final String? backgroundColor;
  final DateTime createdAt;
  final DateTime expiresAt;
  final int viewsCount;
  final bool isMine;
  final bool isViewed;

  StatusModel({
    required this.id,
    required this.userId,
    required this.userName,
    this.userAvatar,
    this.mediaUrl,
    this.textContent,
    this.backgroundColor,
    required this.createdAt,
    required this.expiresAt,
    this.viewsCount = 0,
    this.isMine = false,
    this.isViewed = false,
  });

  factory StatusModel.fromJson(Map<String, dynamic> json, {String? currentUserId}) {
    final userId = json['userId'] ?? '';
    return StatusModel(
      id: json['id'] ?? '',
      userId: userId,
      userName: json['user']?['profile']?['displayName'] ?? json['user']?['profile']?['username'] ?? 'User',
      userAvatar: json['user']?['profile']?['avatar'],
      mediaUrl: json['mediaUrl'],
      textContent: json['textContent'],
      backgroundColor: json['backgroundColor'] ?? '#00A884',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
      expiresAt: json['expiresAt'] != null
          ? DateTime.tryParse(json['expiresAt']) ?? DateTime.now().add(const Duration(hours: 24))
          : DateTime.now().add(const Duration(hours: 24)),
      viewsCount: json['viewsCount'] ?? 0,
      isMine: currentUserId != null && userId == currentUserId,
      isViewed: json['isViewed'] == true,
    );
  }
}
