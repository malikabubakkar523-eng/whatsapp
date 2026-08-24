import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/conversation_model.dart';
import '../common/user_avatar.dart';
import 'message_ticks.dart';

class ChatItemTile extends StatelessWidget {
  final ConversationModel conversation;
  final VoidCallback onTap;
  final bool isTyping;

  const ChatItemTile({
    super.key,
    required this.conversation,
    required this.onTap,
    this.isTyping = false,
  });

  @override
  Widget build(BuildContext context) {
    final lastMsg = conversation.lastMessage;
    final timeStr = conversation.lastMessageAt != null
        ? '${conversation.lastMessageAt!.hour}:${conversation.lastMessageAt!.minute.toString().padLeft(2, '0')}'
        : '';

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Row(
          children: [
            // User Avatar with Online status
            UserAvatar(
              name: conversation.displayName,
              imageUrl: conversation.displayAvatar,
              radius: 26,
              isOnline: conversation.isOnline,
              showOnlineBadge: true,
            ),
            const SizedBox(width: 14),

            // Middle: Name & Last message / Typing
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Flexible(
                        child: Text(
                          conversation.displayName,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimaryDark,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(
                        timeStr,
                        style: TextStyle(
                          fontSize: 12,
                          color: conversation.unreadCount > 0
                              ? AppColors.primaryGreen
                              : AppColors.textSecondaryDark,
                          fontWeight: conversation.unreadCount > 0 ? FontWeight.w600 : FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),

                  Row(
                    children: [
                      if (isTyping)
                        const Text(
                          'Typing...',
                          style: TextStyle(
                            color: AppColors.primaryGreen,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        )
                      else ...[
                        if (lastMsg != null && lastMsg.isMine) ...[
                          MessageTicks(status: lastMsg.status, size: 14),
                          const SizedBox(width: 4),
                        ],
                        Expanded(
                          child: Text(
                            lastMsg?.content ?? (conversation.isGroup ? 'Group created' : 'No messages yet'),
                            style: const TextStyle(
                              fontSize: 13.5,
                              color: AppColors.textSecondaryDark,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],

                      // Unread Badge
                      if (conversation.unreadCount > 0) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                          decoration: const BoxDecoration(
                            color: AppColors.primaryGreen,
                            shape: BoxShape.circle,
                          ),
                          child: Text(
                            conversation.unreadCount.toString(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
