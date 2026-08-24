import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../models/conversation_model.dart';
import '../../models/message_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/chat_provider.dart';
import '../../widgets/chat/chat_input_bar.dart';
import '../../widgets/chat/message_bubble.dart';
import '../../widgets/common/user_avatar.dart';
import '../call/video_call_screen.dart';

class ChatConversationScreen extends StatefulWidget {
  final ConversationModel conversation;

  const ChatConversationScreen({
    super.key,
    required this.conversation,
  });

  @override
  State<ChatConversationScreen> createState() => _ChatConversationScreenState();
}

class _ChatConversationScreenState extends State<ChatConversationScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      if (auth.currentUser != null) {
        Provider.of<ChatProvider>(context, listen: false)
            .fetchMessages(widget.conversation.id, auth.currentUser!.id);
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final chatProvider = Provider.of<ChatProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final messages = chatProvider.getMessages(widget.conversation.id);
    final currentUserId = authProvider.currentUser?.id ?? '';
    final isTyping = chatProvider.isUserTyping(widget.conversation.id);

    return Scaffold(
      backgroundColor: AppColors.darkChatBackground,
      appBar: AppBar(
        backgroundColor: AppColors.darkBackground,
        elevation: 0,
        leadingWidth: 70,
        leading: Row(
          children: [
            IconButton(
              icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
              onPressed: () => Navigator.pop(context),
            ),
            UserAvatar(
              name: widget.conversation.displayName,
              imageUrl: widget.conversation.displayAvatar,
              radius: 17,
              isOnline: widget.conversation.isOnline,
            ),
          ],
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.conversation.displayName,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            Text(
              isTyping
                  ? 'typing...'
                  : (widget.conversation.isOnline ? 'Online' : 'offline'),
              style: TextStyle(
                fontSize: 11,
                color: isTyping || widget.conversation.isOnline
                    ? AppColors.primaryGreen
                    : AppColors.textSecondaryDark,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.videocam_rounded, color: Colors.white, size: 22),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => VideoCallScreen(
                    participantName: widget.conversation.displayName,
                    participantAvatar: widget.conversation.displayAvatar,
                    isVideo: true,
                  ),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.phone_rounded, color: Colors.white, size: 20),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => VideoCallScreen(
                    participantName: widget.conversation.displayName,
                    participantAvatar: widget.conversation.displayAvatar,
                    isVideo: false,
                  ),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.more_vert_rounded, color: Colors.white, size: 20),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Messages Timeline
          Expanded(
            child: messages.isEmpty && !chatProvider.isLoadingMessages
                ? _buildEmptyState()
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    itemCount: messages.length + 1,
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        return Center(
                          child: Container(
                            margin: const EdgeInsets.symmetric(vertical: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.darkSurface.withOpacity(0.9),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              'Today',
                              style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ),
                        );
                      }

                      final msg = messages[index - 1];
                      final isMine = msg.senderId == currentUserId || msg.isMine;

                      return MessageBubble(
                        message: msg,
                        isMine: isMine,
                      );
                    },
                  ),
          ),

          // Typing status banner
          if (isTyping)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              alignment: Alignment.centerLeft,
              child: Row(
                children: [
                  const Text('typing', style: TextStyle(color: AppColors.primaryGreen, fontSize: 12)),
                  const SizedBox(width: 6),
                  Container(
                    width: 4,
                    height: 4,
                    decoration: const BoxDecoration(color: AppColors.primaryGreen, shape: BoxShape.circle),
                  ),
                ],
              ),
            ),

          // Bottom Input Bar
          ChatInputBar(
            onSendMessage: (text) {
              chatProvider.sendMessage(
                conversationId: widget.conversation.id,
                content: text,
                currentUserId: currentUserId,
              );
              Future.delayed(const Duration(milliseconds: 100), _scrollToBottom);
            },
            onAttachment: () {},
            onCamera: () {},
            onVoiceRecord: () {
              // Send mock voice message for demonstration
              chatProvider.sendMessage(
                conversationId: widget.conversation.id,
                content: 'Voice note (0:14)',
                currentUserId: currentUserId,
                type: MessageType.AUDIO,
              );
              Future.delayed(const Duration(milliseconds: 100), _scrollToBottom);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: const BoxDecoration(
              color: AppColors.darkSurface,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.send_rounded, color: AppColors.primaryGreen, size: 24),
          ),
          const SizedBox(height: 12),
          const Text(
            'No messages yet',
            style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          const Text(
            'Say hello to start chatting in real time!',
            style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 12),
          ),
        ],
      ),
    );
  }
}
