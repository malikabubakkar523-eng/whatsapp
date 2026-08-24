import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/message_model.dart';
import 'image_message_bubble.dart';
import 'message_ticks.dart';
import 'voice_message_player.dart';

class MessageBubble extends StatelessWidget {
  final MessageModel message;
  final bool isMine;
  final VoidCallback? onLongPress;

  const MessageBubble({
    super.key,
    required this.message,
    required this.isMine,
    this.onLongPress,
  });

  @override
  Widget build(BuildContext context) {
    if (message.type == MessageType.AUDIO) {
      return Align(
        alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 3),
          child: VoiceMessagePlayer(message: message, isMine: isMine),
        ),
      );
    }

    if (message.type == MessageType.IMAGE) {
      return Align(
        alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 3),
          child: ImageMessageBubble(message: message, isMine: isMine),
        ),
      );
    }

    final bubbleColor = isMine ? AppColors.darkOutgoingBubble : AppColors.darkIncomingBubble;

    return Align(
      alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
      child: GestureDetector(
        onLongPress: onLongPress,
        child: Container(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.76,
          ),
          margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 2.5),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: bubbleColor,
            borderRadius: BorderRadius.only(
              topLeft: const Radius.circular(16),
              topRight: const Radius.circular(16),
              bottomLeft: Radius.circular(isMine ? 16 : 4),
              bottomRight: Radius.circular(isMine ? 4 : 16),
            ),
          ),
          child: Wrap(
            alignment: WrapAlignment.end,
            crossAxisAlignment: WrapCrossAlignment.end,
            spacing: 8,
            runSpacing: 2,
            children: [
              Text(
                message.content,
                style: const TextStyle(
                  color: AppColors.textPrimaryDark,
                  fontSize: 14.5,
                  height: 1.3,
                ),
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    '${message.createdAt.hour}:${message.createdAt.minute.toString().padLeft(2, '0')}',
                    style: const TextStyle(
                      color: AppColors.textSecondaryDark,
                      fontSize: 10.5,
                    ),
                  ),
                  if (isMine) ...[
                    const SizedBox(width: 4),
                    MessageTicks(status: message.status, size: 13),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
