class UserModel {
  final String id;
  final String email;
  final String role;
  final UserProfile profile;

  UserModel({
    required this.id,
    required this.email,
    required this.role,
    required this.profile,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'USER',
      profile: UserProfile.fromJson(json['profile'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'role': role,
        'profile': profile.toJson(),
      };
}

class UserProfile {
  final String username;
  final String displayName;
  final String? avatar;
  final String? bio;
  final bool isOnline;
  final DateTime? lastSeen;

  UserProfile({
    required this.username,
    required this.displayName,
    this.avatar,
    this.bio,
    this.isOnline = false,
    this.lastSeen,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      username: json['username'] ?? '',
      displayName: json['displayName'] ?? json['username'] ?? 'User',
      avatar: json['avatar'],
      bio: json['bio'],
      isOnline: json['isOnline'] == true,
      lastSeen: json['lastSeen'] != null ? DateTime.tryParse(json['lastSeen']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'username': username,
        'displayName': displayName,
        'avatar': avatar,
        'bio': bio,
        'isOnline': isOnline,
        'lastSeen': lastSeen?.toIso8601String(),
      };
}
