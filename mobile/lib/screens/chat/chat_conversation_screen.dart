import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../models/conversation_model.dart';
import '../../models/message_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/chat_provider.dart';
import '../../widgets/chat/chat_input_bar.dart';
import '../../widgets/chat/message_bubble.dart';
import '../../widgets/common/modern_dot_loader.dart';
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
      final chat = Provider.of<ChatProvider>(context, listen: false);
      chat.setCurrentlyOpenConversation(widget.conversation.id);

      if (auth.currentUser != null) {
        chat.fetchMessages(widget.conversation.id, auth.currentUser!.id);
      }
    });
  }

  @override
  void dispose() {
    // Unset active conversation on screen exit
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        Provider.of<ChatProvider>(context, listen: false).setCurrentlyOpenConversation(null);
      }
    });
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        0.0,
        duration: const Duration(milliseconds: 200),
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

    // Prepare reversed list so index 0 is the newest message at the bottom
    final reversedMessages = messages.reversed.toList();

    return Scaffold(
      backgroundColor: AppColors.darkChatBackground,
      appBar: AppBar(
        backgroundColor: AppColors.darkBackground,
        elevation: 0,
        leadingWidth: 72,
        leading: Row(
          children: [
            IconButton(
              icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 19),
              onPressed: () => Navigator.pop(context),
            ),
            UserAvatar(
              name: widget.conversation.displayName,
              imageUrl: widget.conversation.displayAvatar,
              radius: 16,
              isOnline: widget.conversation.isOnline,
            ),
          ],
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.conversation.displayName,
              style: const TextStyle(fontSize: 15.5, fontWeight: FontWeight.bold, color: Colors.white),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            Row(
              children: [
                if (widget.conversation.isOnline && !isTyping)
                  Container(
                    width: 6,
                    height: 6,
                    margin: const EdgeInsets.only(right: 4),
                    decoration: const BoxDecoration(
                      color: AppColors.primaryGreen,
                      shape: BoxShape.circle,
                    ),
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
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
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
            child: chatProvider.isLoadingMessages && messages.isEmpty
                ? const Center(
                    child: ModernDotLoader(size: 10, spacing: 6),
                  )
                : messages.isEmpty
                    ? _buildEmptyState()
                    : RawScrollbar(
                        controller: _scrollController,
                        thumbVisibility: true,
                        thickness: 4.0,
                        radius: const Radius.circular(4),
                        thumbColor: AppColors.primaryGreen.withOpacity(0.5),
                        child: ListView.builder(
                          controller: _scrollController,
                          reverse: true, // index 0 is bottom
                          physics: const BouncingScrollPhysics(),
                          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                          itemCount: reversedMessages.length,
                          itemBuilder: (context, index) {
                            final msg = reversedMessages[index];
                            final isMine = msg.senderId == currentUserId || msg.isMine;

                            return MessageBubble(
                              message: msg,
                              isMine: isMine,
                            );
                          },
                        ),
                      ),
          ),

          // Typing status banner
          if (isTyping)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              alignment: Alignment.centerLeft,
              color: AppColors.darkSurface.withOpacity(0.5),
              child: Row(
                children: [
                  const Text('typing', style: TextStyle(color: AppColors.primaryGreen, fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(width: 8),
                  const ModernDotLoader(size: 5, spacing: 3),
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
              _scrollToBottom();
            },
            onAttachment: () {},
            onCamera: () {},
            onVoiceRecord: () {
              chatProvider.sendMessage(
                conversationId: widget.conversation.id,
                content: 'Voice note (0:14) 🎙️',
                currentUserId: currentUserId,
                type: MessageType.AUDIO,
              );
              _scrollToBottom();
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
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: AppColors.darkSurface,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.primaryGreen.withOpacity(0.3), width: 1.5),
            ),
            child: const Icon(Icons.mark_chat_unread_rounded, color: AppColors.primaryGreen, size: 26),
          ),
          const SizedBox(height: 14),
          const Text(
            'Start a conversation',
            style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          const Text(
            'Messages are end-to-end encrypted & instant.',
            style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 12),
          ),
        ],
      ),
    );
  }
}
