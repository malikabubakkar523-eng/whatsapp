import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';
import '../../models/conversation_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/chat_provider.dart';
import '../../widgets/chat/chat_item_tile.dart';
import '../ai/meta_ai_screen.dart';
import '../chat/chat_conversation_screen.dart';
import '../chat/new_chat_screen.dart';

class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  final List<String> _filters = ['All', 'Unread', 'Groups', 'Archived'];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      if (auth.currentUser != null) {
        final chat = Provider.of<ChatProvider>(context, listen: false);
        chat.initSocketListeners(auth.currentUser!.id);
        chat.fetchConversations(auth.currentUser!.id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final chatProvider = Provider.of<ChatProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final conversations = chatProvider.conversations;

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar: "ChatFlow" + Icons
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'ChatFlow',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.camera_alt_outlined, color: Colors.white, size: 22),
                        onPressed: () {},
                      ),
                      IconButton(
                        icon: const Icon(Icons.more_vert_rounded, color: Colors.white, size: 22),
                        onPressed: () {},
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Search Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.darkSurface,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
                  border: Border.all(color: AppColors.darkBorder, width: 0.6),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.search_rounded, color: AppColors.textSecondaryDark, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'Search chats...',
                      style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 14),
                    ),
                  ],
                ),
              ),
            ),

            // Filter Chips (All, Unread, Groups, Archived)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
              child: SizedBox(
                height: 32,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _filters.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    final filter = _filters[index];
                    final isSelected = chatProvider.activeFilter == filter;

                    return GestureDetector(
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
                            fontSize: 12.5,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            color: isSelected ? AppColors.primaryGreen : AppColors.textSecondaryDark,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            // Chat List Body
            Expanded(
              child: RefreshIndicator(
                color: AppColors.primaryGreen,
                onRefresh: () async {
                  if (authProvider.currentUser != null) {
                    await chatProvider.fetchConversations(authProvider.currentUser!.id);
                  }
                },
                child: ListView(
                  padding: EdgeInsets.zero,
                  children: [
                    // Meta AI Assistant Pinned Card
                    ListTile(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const MetaAIScreen()),
                        );
                      },
                      leading: Container(
                        width: 52,
                        height: 52,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(
                            colors: [Color(0xFF00D2FF), Color(0xFF9333EA)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        child: const Center(
                          child: Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 24),
                        ),
                      ),
                      title: const Row(
                        children: [
                          Text(
                            'Meta AI',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          SizedBox(width: 6),
                          Icon(Icons.verified_rounded, color: Color(0xFF00D2FF), size: 16),
                        ],
                      ),
                      subtitle: const Text(
                        'Ask me anything or say hi! ✨',
                        style: TextStyle(fontSize: 13, color: AppColors.textSecondaryDark),
                        maxLines: 1,
                      ),
                      trailing: const Text(
                        'AI',
                        style: TextStyle(color: Color(0xFF00D2FF), fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const Divider(color: AppColors.darkBorder, height: 1, indent: 76),

                    if (chatProvider.isLoadingConversations && conversations.isEmpty)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(32.0),
                          child: CircularProgressIndicator(color: AppColors.primaryGreen),
                        ),
                      )
                    else if (conversations.isEmpty)
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.all(40.0),
                          child: Column(
                            children: [
                              Container(
                                width: 64,
                                height: 64,
                                decoration: const BoxDecoration(
                                  color: AppColors.darkSurface,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.chat_bubble_outline_rounded,
                                    color: AppColors.primaryGreen, size: 28),
                              ),
                              const SizedBox(height: 12),
                              const Text(
                                'No conversations yet',
                                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 6),
                              const Text(
                                'Tap the + button to start a new chat with friends',
                                textAlign: TextAlign.center,
                                style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                      )
                    else
                      ...conversations.map(
                        (c) => ChatItemTile(
                          conversation: c,
                          isTyping: chatProvider.isUserTyping(c.id),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => ChatConversationScreen(conversation: c),
                              ),
                            );
                          },
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
