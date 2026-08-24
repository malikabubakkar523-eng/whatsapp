import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';
import '../../models/conversation_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/chat_provider.dart';
import '../../widgets/chat/chat_item_tile.dart';
import '../../widgets/common/user_avatar.dart';
import '../ai/meta_ai_screen.dart';
import '../chat/chat_conversation_screen.dart';
import '../chat/new_chat_screen.dart';
import '../chat/search_messages_screen.dart';

class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      if (auth.currentUser != null) {
        Provider.of<ChatProvider>(context, listen: false)
            .fetchConversations(auth.currentUser!.id);
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final chatProvider = Provider.of<ChatProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.currentUser;
    final conversations = chatProvider.filteredConversations;

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // 1. Floating Header
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: Row(
                children: [
                  UserAvatar(
                    name: user?.profile.displayName ?? 'Me',
                    imageUrl: user?.profile.avatar,
                    radius: 20,
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'Chats',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.search_rounded, color: Colors.white, size: 24),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const SearchMessagesScreen()),
                      );
                    },
                  ),
                  IconButton(
                    icon: const Icon(Icons.edit_square, color: AppColors.primaryGreen, size: 22),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const NewChatScreen()),
                      );
                    },
                  ),
                ],
              ),
            ),

            // 2. Search Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 6.0),
              child: GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const SearchMessagesScreen()),
                  );
                },
                child: Container(
                  height: 42,
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: AppColors.darkSurface,
                    borderRadius: BorderRadius.circular(21),
                    border: Border.all(color: AppColors.darkBorder, width: 0.8),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.search_rounded, color: AppColors.textSecondaryDark, size: 20),
                      SizedBox(width: 10),
                      Text(
                        'Search conversations...',
                        style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 13.5),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // 3. Filter Chips Row (All, Unread, Groups, Favorites)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Row(
                children: ['All', 'Unread', 'Groups', 'Favorites'].map((filter) {
                  final isSelected = chatProvider.activeFilter == filter;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: GestureDetector(
                      onTap: () => chatProvider.setFilter(filter),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.darkGreen.withOpacity(0.35) : AppColors.darkSurface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected ? AppColors.primaryGreen : AppColors.darkBorder,
                            width: isSelected ? 1.2 : 0.8,
                          ),
                        ),
                        child: Text(
                          filter,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            color: isSelected ? AppColors.primaryGreen : AppColors.textSecondaryDark,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            // 4. Chat List
            Expanded(
              child: ListView(
                padding: const EdgeInsets.only(bottom: 90),
                children: [
                  // Pinned Meta AI Assistant Entry
                  ListTile(
                    leading: Container(
                      width: 52,
                      height: 52,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          colors: [Color(0xFF00D2FF), Color(0xFF9333EA)],
                        ),
                      ),
                      child: const Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 24),
                    ),
                    title: const Row(
                      children: [
                        Text('Meta AI', style: TextStyle(fontSize: 15.5, fontWeight: FontWeight.bold, color: Colors.white)),
                        SizedBox(width: 4),
                        Icon(Icons.verified_rounded, color: Color(0xFF00D2FF), size: 14),
                      ],
                    ),
                    subtitle: const Text(
                      'Ask me anything! Quantum computing, summaries & more',
                      style: TextStyle(fontSize: 12.5, color: AppColors.primaryGreen),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    trailing: const Icon(Icons.push_pin_rounded, color: AppColors.textSecondaryDark, size: 16),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const MetaAIScreen()),
                      );
                    },
                  ),
                  const Divider(color: AppColors.darkBorder, height: 1, indent: 76),

                  // User Conversations List
                  if (chatProvider.isLoading && conversations.isEmpty)
                    const Padding(
                      padding: EdgeInsets.all(32.0),
                      child: Center(
                        child: CircularProgressIndicator(color: AppColors.primaryGreen),
                      ),
                    )
                  else if (conversations.isEmpty)
                    _buildEmptyState()
                  else
                    ...conversations.map(
                      (conv) => ChatItemTile(
                        conversation: conv,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ChatConversationScreen(conversation: conv),
                            ),
                          );
                        },
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Padding(
      padding: const EdgeInsets.all(40.0),
      child: Center(
        child: Column(
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: const BoxDecoration(
                color: AppColors.darkSurface,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.chat_bubble_outline_rounded, color: AppColors.primaryGreen, size: 28),
            ),
            const SizedBox(height: 14),
            const Text(
              'No conversations yet',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            const Text(
              'Tap the write button above to start your first chat!',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }
}
