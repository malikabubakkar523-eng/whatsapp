class ApiEndpoints {
  // Default base URL for local development (Use 10.0.2.2 for Android Emulator or actual machine IP for physical devices)
  static const String baseUrl = 'http://10.0.2.2:3000/api';
  static const String socketUrl = 'http://10.0.2.2:3000';

  // Auth
  static const String login = '$baseUrl/auth/login';
  static const String register = '$baseUrl/auth/register';
  static const String me = '$baseUrl/auth/me';
  static const String logout = '$baseUrl/auth/logout';

  // Conversations & Messages
  static const String conversations = '$baseUrl/conversations';
  static String messages(String conversationId) => '$baseUrl/conversations/$conversationId/messages';
  static String deleteMessage(String messageId) => '$baseUrl/messages/$messageId';
  static String reactMessage(String messageId) => '$baseUrl/messages/$messageId/reaction';
  static String markRead(String messageId) => '$baseUrl/messages/$messageId/read';

  // Users & Search
  static const String searchUsers = '$baseUrl/users/search';
  static const String userProfile = '$baseUrl/users/profile';
  static const String userSettings = '$baseUrl/users/settings';

  // Calls & WebRTC
  static const String calls = '$baseUrl/calls';

  // Stories & Status
  static const String status = '$baseUrl/status';
  static String viewStatus(String statusId) => '$baseUrl/status/$statusId/view';
  static String likeStatus(String statusId) => '$baseUrl/status/$statusId/like';

  // Meta AI
  static const String aiChat = '$baseUrl/ai/chat';
}
