import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/constants/app_colors.dart';
import '../../models/conversation_model.dart';
import '../../models/user_model.dart';
import '../../services/api_service.dart';
import '../../widgets/common/modern_dot_loader.dart';
import '../../widgets/common/user_avatar.dart';
import '../chat/chat_conversation_screen.dart';

class ProfileVisitorsScreen extends StatefulWidget {
  const ProfileVisitorsScreen({super.key});

  @override
  State<ProfileVisitorsScreen> createState() => _ProfileVisitorsScreenState();
}

class _ProfileVisitorsScreenState extends State<ProfileVisitorsScreen> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _visitors = [];
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchVisitors();
  }

  Future<void> _fetchVisitors() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final res = await ApiService.get(ApiEndpoints.profileVisitors);
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['visitors'] is List) {
          setState(() {
            _visitors = List<Map<String, dynamic>>.from(data['visitors']);
            _isLoading = false;
          });
          return;
        }
      }
      setState(() {
        _errorMessage = 'Could not load visitors';
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Network error. Please try again.';
        _isLoading = false;
      });
    }
  }

  String _formatVisitedTime(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      final now = DateTime.now();
      final diff = now.difference(dt);

      if (diff.inSeconds < 60) return 'Just now';
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      if (diff.inDays == 1) return 'Yesterday ${DateFormat('h:mm a').format(dt)}';
      return DateFormat('MMM d, h:mm a').format(dt);
    } catch (_) {
      return '';
    }
  }

  Future<void> _startChatWithUser(Map<String, dynamic> visitorData) async {
    final visitor = visitorData['visitor'] ?? {};
    final visitorId = visitor['id'] ?? visitorData['visitorId'];

    if (visitorId == null) return;

    try {
      // Find or create direct conversation
      final res = await ApiService.post(ApiEndpoints.conversations, {
        'participantIds': [visitorId],
        'isGroup': false,
      });

      if (res.statusCode == 200 || res.statusCode == 201) {
        final data = jsonDecode(res.body);
        final conv = ConversationModel.fromJson(data['conversation'] ?? data);
        if (mounted) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => ChatConversationScreen(conversation: conv),
            ),
          );
        }
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to open chat. Please try again.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        title: const Text('Profile Visitors', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: AppColors.darkBackground,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white),
            onPressed: _fetchVisitors,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: ModernDotLoader(size: 10, spacing: 6))
          : _errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_errorMessage!, style: const TextStyle(color: Colors.white70)),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: _fetchVisitors,
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryGreen),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : _visitors.isEmpty
                  ? _buildEmptyState()
                  : RefreshIndicator(
                      onRefresh: _fetchVisitors,
                      color: AppColors.primaryGreen,
                      child: ListView.separated(
                        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        itemCount: _visitors.length,
                        separatorBuilder: (context, index) => const Divider(color: AppColors.darkBorder, height: 1),
                        itemBuilder: (context, index) {
                          final item = _visitors[index];
                          final visitor = item['visitor'] ?? {};
                          final displayName = visitor['displayName'] ?? 'User';
                          final username = visitor['username'] ?? 'user';
                          final avatar = visitor['avatar'];
                          final isOnline = visitor['isOnline'] == true;
                          final visitedAt = item['lastVisitedAt'] ?? item['visitedAt'];
                          final visitCount = item['visitCount'] ?? 1;

                          return ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                            leading: UserAvatar(
                              name: displayName,
                              imageUrl: avatar,
                              radius: 22,
                              isOnline: isOnline,
                            ),
                            title: Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    displayName,
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                Text(
                                  _formatVisitedTime(visitedAt),
                                  style: const TextStyle(color: AppColors.primaryGreen, fontSize: 11.5, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                            subtitle: Row(
                              children: [
                                Text(
                                  '@$username',
                                  style: const TextStyle(color: AppColors.textSecondaryDark, fontSize: 12.5),
                                ),
                                if (visitCount > 1) ...[
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppColors.primaryGreen.withOpacity(0.18),
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(color: AppColors.primaryGreen.withOpacity(0.3), width: 0.8),
                                    ),
                                    child: Text(
                                      'Viewed $visitCount times',
                                      style: const TextStyle(color: AppColors.primaryGreen, fontSize: 10, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            trailing: ElevatedButton(
                              onPressed: () => _startChatWithUser(item),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.darkSurfaceElevated,
                                foregroundColor: AppColors.primaryGreen,
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  side: Border.all(color: AppColors.primaryGreen.withOpacity(0.4), width: 0.8),
                                ),
                              ),
                              child: const Text('Chat', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: AppColors.darkSurface,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.primaryGreen.withOpacity(0.35), width: 1.5),
            ),
            child: const Icon(Icons.remove_red_eye_rounded, color: AppColors.primaryGreen, size: 28),
          ),
          const SizedBox(height: 16),
          const Text(
            'No profile visitors yet',
            style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 32.0),
            child: Text(
              'When other users visit your profile, you will see their details and time of visit right here in real time.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 12.5),
            ),
          ),
        ],
      ),
    );
  }
}
