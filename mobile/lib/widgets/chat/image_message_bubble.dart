import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/message_model.dart';
import 'message_ticks.dart';

class ImageMessageBubble extends StatelessWidget {
  final MessageModel message;
  final bool isMine;

  const ImageMessageBubble({
    super.key,
    required this.message,
    required this.isMine,
  });

  @override
  Widget build(BuildContext context) {
    final bubbleColor = isMine ? AppColors.darkOutgoingBubble : AppColors.darkIncomingBubble;
    final imageUrl = message.attachments.isNotEmpty
        ? message.attachments.first.url
        : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800';

    return Container(
      constraints: const BoxConstraints(maxWidth: 260),
      decoration: BoxDecoration(
        color: bubbleColor,
        borderRadius: BorderRadius.only(
          topLeft: const Radius.circular(16),
          topRight: const Radius.circular(16),
          bottomLeft: Radius.circular(isMine ? 16 : 4),
          bottomRight: Radius.circular(isMine ? 4 : 16),
        ),
      ),
      padding: const EdgeInsets.all(4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Stack(
              children: [
                Image.network(
                  imageUrl,
                  width: double.infinity,
                  height: 160,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    height: 160,
                    color: AppColors.darkSurface,
                    child: const Icon(Icons.image, color: AppColors.textSecondaryDark, size: 40),
                  ),
                ),
                Positioned(
                  right: 8,
                  bottom: 6,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.6),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '${message.createdAt.hour}:${message.createdAt.minute.toString().padLeft(2, '0')}',
                          style: const TextStyle(color: Colors.white, fontSize: 10),
                        ),
                        if (isMine) ...[
                          const SizedBox(width: 4),
                          MessageTicks(status: message.status, size: 12),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          if (message.content.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 6, 8, 4),
              child: Text(
                message.content,
                style: const TextStyle(color: AppColors.textPrimaryDark, fontSize: 14),
              ),
            ),
        ],
      ),
    );
  }
}
