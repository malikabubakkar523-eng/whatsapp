import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/constants/app_colors.dart';
import '../../models/conversation_model.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../services/socket_service.dart';
import '../../widgets/common/modern_dot_loader.dart';
import '../../widgets/common/user_avatar.dart';
import 'chat_conversation_screen.dart';

class NewChatScreen extends StatefulWidget {
  const NewChatScreen({super.key});

  @override
  State<NewChatScreen> createState() => _NewChatScreenState();
}

class _NewChatScreenState extends State<NewChatScreen> {
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounce;
  bool _isSearching = false;
  List<Map<String, dynamic>> _searchResults = [];
  String _searchQuery = '';

  final List<Map<String, String>> _frequentContacts = const [
    {
      'id': 'usr_emma',
      'name': 'Emma Watson',
      'username': 'emma_watson',
      'bio': 'Hey there! I am using ChatFlow 💬',
      'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    },
    {
      'id': 'usr_michael',
      'name': 'Michael Brown',
      'username': 'michael_b',
      'bio': 'Available for video calls 🚀',
      'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    },
    {
      'id': 'usr_sarah',
      'name': 'Sarah Wilson',
      'username': 'sarah_w',
      'bio': 'Focus mode on ⚡',
      'avatar': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    },
    {
      'id': 'usr_alex',
      'name': 'Alex Rivera',
      'username': 'alex_r',
      'bio': 'Designing the future 🎨',
      'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    },
  ];

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    _debounce?.cancel();
    _searchQuery = query.trim();

    if (_searchQuery.isEmpty) {
      setState(() {
        _isSearching = false;
        _searchResults = [];
      });
      return;
    }

    setState(() => _isSearching = true);

    _debounce = Timer(const Duration(milliseconds: 250), () {
      _performSearch(_searchQuery);
    });
  }

  Future<void> _performSearch(String query) async {
    try {
      final res = await ApiService.get('${ApiEndpoints.searchUsers}?q=${Uri.encodeComponent(query)}');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['users'] is List) {
          setState(() {
            _searchResults = List<Map<String, dynamic>>.from(data['users']);
            _isSearching = false;
          });
          return;
        }
      }
    } catch (_) {}

    // Fallback client-side filter
    final filtered = _frequentContacts.where((c) {
      return c['name']!.toLowerCase().contains(query.toLowerCase()) ||
          c['username']!.toLowerCase().contains(query.toLowerCase());
    }).toList();

    setState(() {
      _searchResults = filtered.map((c) => {
        'id': c['id'],
        'username': c['username'],
        'displayName': c['name'],
        'avatar': c['avatar'],
        'bio': c['bio'],
        'isOnline': true,
      }).toList();
      _isSearching = false;
    });
  }

  Future<void> _startChatWithUser(String targetUserId, String displayName, String? avatar) async {
    try {
      final res = await ApiService.post(ApiEndpoints.conversations, {
        'participantIds': [targetUserId],
        'isGroup': false,
      });

      if (res.statusCode == 200 || res.statusCode == 201) {
        final data = jsonDecode(res.body);
        final conv = ConversationModel.fromJson(data['conversation'] ?? data);
        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (_) => ChatConversationScreen(conversation: conv),
            ),
          );
        }
      }
    } catch (_) {
      // Create local temporary conversation for immediate zero-lag chat
      final tempConv = ConversationModel(
        id: 'conv_$targetUserId',
        isGroup: false,
        name: displayName,
        avatar: avatar,
        isArchived: false,
        isPinned: false,
        unreadCount: 0,
        lastMessage: 'Tap here to chat',
        lastMessageAt: DateTime.now(),
        members: [],
      );

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => ChatConversationScreen(conversation: tempConv),
          ),
        );
      }
    }
  }

  void _showUserProfileSheet(Map<String, dynamic> user) {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final targetUserId = user['id'] ?? user['userId'] ?? '';
    final displayName = user['displayName'] ?? user['name'] ?? 'User';
    final username = user['username'] ?? 'user';
    final avatar = user['avatar'];
    final bio = user['bio'] ?? 'Hey there! I am using ChatFlow 💬';
    final isOnline = user['isOnline'] == true;

    // Record Profile Visit API & Socket Event
    if (targetUserId.isNotEmpty && auth.currentUser?.id != null && targetUserId != auth.currentUser!.id) {
      ApiService.post(ApiEndpoints.recordProfileVisit, {
        'targetUserId': targetUserId,
      }).catchError((_) => null);

      SocketService.emitProfileVisit(targetUserId, {
        'id': auth.currentUser!.id,
        'username': auth.currentUser!.profile.username,
        'displayName': auth.currentUser!.profile.displayName,
        'avatar': auth.currentUser!.profile.avatar,
      });
    }

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.darkSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 20),
                UserAvatar(
                  name: displayName,
                  imageUrl: avatar,
                  radius: 40,
                  isOnline: isOnline,
                ),
                const SizedBox(height: 14),
                Text(
                  displayName,
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                Text(
                  '@$username',
                  style: const TextStyle(fontSize: 14, color: AppColors.primaryGreen, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppColors.darkBackground,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    bio,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.chat_bubble_rounded, size: 18),
                        label: const Text('Start Chat', style: TextStyle(fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryGreen,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        onPressed: () {
                          Navigator.pop(ctx);
                          _startChatWithUser(targetUserId, displayName, avatar);
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        title: const Text('Find People', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
        backgroundColor: AppColors.darkBackground,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Instant Search Bar with Live Suggestions
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Search by @username or name...',
                hintStyle: const TextStyle(color: AppColors.textSecondaryDark, fontSize: 13.5),
                prefixIcon: const Icon(Icons.search_rounded, color: AppColors.primaryGreen, size: 20),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.close_rounded, color: Colors.white60, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          _onSearchChanged('');
                        },
                      )
                    : null,
                filled: true,
                fillColor: AppColors.darkSurface,
                contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          // Searching Loader
          if (_isSearching)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 16.0),
              child: ModernDotLoader(size: 8, spacing: 5),
            ),

          Expanded(
            child: _searchQuery.isNotEmpty
                ? _buildSearchResultsList()
                : _buildDefaultContactsList(),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchResultsList() {
    if (_searchResults.isEmpty && !_isSearching) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.person_search_rounded, size: 48, color: Colors.white24),
            const SizedBox(height: 12),
            Text(
              'No users found for "$_searchQuery"',
              style: const TextStyle(color: Colors.white70, fontSize: 14),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      physics: const BouncingScrollPhysics(),
      itemCount: _searchResults.length,
      separatorBuilder: (_, __) => const Divider(color: AppColors.darkBorder, height: 1),
      itemBuilder: (context, index) {
        final user = _searchResults[index];
        final id = user['id'] ?? user['userId'] ?? '';
        final displayName = user['displayName'] ?? user['name'] ?? 'User';
        final username = user['username'] ?? 'user';
        final avatar = user['avatar'];
        final bio = user['bio'] ?? '';
        final isOnline = user['isOnline'] == true;

        return ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          leading: UserAvatar(
            name: displayName,
            imageUrl: avatar,
            radius: 22,
            isOnline: isOnline,
          ),
          title: Text(
            displayName,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14.5),
          ),
          subtitle: Text(
            '@$username ${bio.isNotEmpty ? "• $bio" : ""}',
            style: const TextStyle(color: AppColors.textSecondaryDark, fontSize: 12),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: const Icon(Icons.info_outline_rounded, color: Colors.white70, size: 20),
                tooltip: 'View Profile',
                onPressed: () => _showUserProfileSheet(user),
              ),
              ElevatedButton(
                onPressed: () => _startChatWithUser(id, displayName, avatar),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
                child: const Text('Chat', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          onTap: () => _showUserProfileSheet(user),
        );
      },
    );
  }

  Widget _buildDefaultContactsList() {
    return ListView(
      physics: const BouncingScrollPhysics(),
      children: [
        ListTile(
          leading: _buildActionIcon(Icons.group_add_rounded),
          title: const Text('New Group', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
          onTap: () {},
        ),
        ListTile(
          leading: _buildActionIcon(Icons.person_add_alt_1_rounded),
          title: const Text('New Contact', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
          onTap: () {},
        ),
        ListTile(
          leading: _buildActionIcon(Icons.groups_rounded),
          title: const Text('New Community', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
          onTap: () {},
        ),
        const Divider(color: AppColors.darkBorder, height: 20),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Text(
            'Suggested People',
            style: TextStyle(
              color: AppColors.primaryGreen,
              fontSize: 12.5,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
        ),
        ..._frequentContacts.map(
          (c) => ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            leading: UserAvatar(
              name: c['name']!,
              imageUrl: c['avatar'],
              radius: 22,
              isOnline: true,
            ),
            title: Text(
              c['name']!,
              style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            subtitle: Text(
              '@${c['username']!} • ${c['bio']!}',
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.info_outline_rounded, color: Colors.white70, size: 20),
                  tooltip: 'View Profile',
                  onPressed: () => _showUserProfileSheet(c),
                ),
                ElevatedButton(
                  onPressed: () => _startChatWithUser(c['id']!, c['name']!, c['avatar']),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGreen,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  child: const Text('Chat', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            onTap: () => _showUserProfileSheet(c),
          ),
        ),
      ],
    );
  }

  Widget _buildActionIcon(IconData icon) {
    return Container(
      width: 42,
      height: 42,
      decoration: const BoxDecoration(
        color: AppColors.primaryGreen,
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: Colors.white, size: 20),
    );
  }
}
