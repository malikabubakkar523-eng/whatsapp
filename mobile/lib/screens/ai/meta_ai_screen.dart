import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/message_model.dart';
import '../../widgets/chat/chat_input_bar.dart';
import '../../widgets/chat/message_bubble.dart';

class MetaAIScreen extends StatefulWidget {
  const MetaAIScreen({super.key});

  @override
  State<MetaAIScreen> createState() => _MetaAIScreenState();
}

class _MetaAIScreenState extends State<MetaAIScreen> {
  final List<MessageModel> _messages = [
    MessageModel(
      id: 'ai_1',
      conversationId: 'ai_conv',
      senderId: 'meta_ai',
      content: "Hello! I'm Meta AI. 👋\nHow can I help you today?",
      type: MessageType.TEXT,
      isMine: false,
      status: MessageStatus.READ,
      createdAt: DateTime.now().subtract(const Duration(minutes: 5)),
    ),
    MessageModel(
      id: 'ai_2',
      conversationId: 'ai_conv',
      senderId: 'user_me',
      content: 'Explain quantum computing in simple terms',
      type: MessageType.TEXT,
      isMine: true,
      status: MessageStatus.READ,
      createdAt: DateTime.now().subtract(const Duration(minutes: 4)),
    ),
    MessageModel(
      id: 'ai_3',
      conversationId: 'ai_conv',
      senderId: 'meta_ai',
      content:
          'Quantum computing uses quantum bits or qubits that can exist in multiple states simultaneously, thanks to superposition.\n\nThis allows quantum computers to solve complex calculations much faster than classical computers! ⚡',
      type: MessageType.TEXT,
      isMine: false,
      status: MessageStatus.READ,
      createdAt: DateTime.now().subtract(const Duration(minutes: 3)),
    ),
  ];

  final List<String> _suggestions = [
    'Tell a joke 😄',
    'Motivate me 🚀',
    'News today 📰',
    'Summarize text 📝',
    'Coding help 💻',
  ];

  void _sendMessage(String text) {
    final userMsg = MessageModel(
      id: 'msg_${DateTime.now().millisecondsSinceEpoch}',
      conversationId: 'ai_conv',
      senderId: 'user_me',
      content: text,
      type: MessageType.TEXT,
      isMine: true,
      status: MessageStatus.READ,
      createdAt: DateTime.now(),
    );

    setState(() {
      _messages.add(userMsg);
    });

    // Simulate AI intelligent response
    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) {
        setState(() {
          _messages.add(
            MessageModel(
              id: 'ai_${DateTime.now().millisecondsSinceEpoch}',
              conversationId: 'ai_conv',
              senderId: 'meta_ai',
              content: "Here is what I found for: '$text'\n\nChatFlow's built-in Meta AI assistant is ready to help you with code, advice, and ideas anytime!",
              type: MessageType.TEXT,
              isMine: false,
              status: MessageStatus.READ,
              createdAt: DateTime.now(),
            ),
          );
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkChatBackground,
      appBar: AppBar(
        backgroundColor: AppColors.darkBackground,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [Color(0xFF00D2FF), Color(0xFF9333EA)],
                ),
              ),
              child: const Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 18),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text('Meta AI', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                    SizedBox(width: 4),
                    Icon(Icons.verified_rounded, color: Color(0xFF00D2FF), size: 14),
                  ],
                ),
                Text('Always active', style: TextStyle(fontSize: 11, color: AppColors.primaryGreen)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert_rounded, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Messages Timeline
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 12),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return MessageBubble(
                  message: msg,
                  isMine: msg.isMine,
                );
              },
            ),
          ),

          // Suggestion Chips Row
          Container(
            height: 40,
            margin: const EdgeInsets.only(bottom: 6),
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: _suggestions.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final suggestion = _suggestions[index];
                return ActionChip(
                  label: Text(
                    suggestion,
                    style: const TextStyle(fontSize: 12, color: AppColors.textPrimaryDark),
                  ),
                  backgroundColor: AppColors.darkSurface,
                  side: const BorderSide(color: AppColors.darkBorder, width: 0.8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  onPressed: () => _sendMessage(suggestion),
                );
              },
            ),
          ),

          // Input Bar
          ChatInputBar(
            onSendMessage: _sendMessage,
          ),
        ],
      ),
    );
  }
}
