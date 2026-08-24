import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';

class ChatInputBar extends StatefulWidget {
  final ValueChanged<String> onSendMessage;
  final VoidCallback? onAttachment;
  final VoidCallback? onCamera;
  final VoidCallback? onVoiceRecord;
  final ValueChanged<String>? onTyping;

  const ChatInputBar({
    super.key,
    required this.onSendMessage,
    this.onAttachment,
    this.onCamera,
    this.onVoiceRecord,
    this.onTyping,
  });

  @override
  State<ChatInputBar> createState() => _ChatInputBarState();
}

class _ChatInputBarState extends State<ChatInputBar> {
  final TextEditingController _controller = TextEditingController();
  bool _hasText = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleSend() {
    final text = _controller.text.trim();
    if (text.isNotEmpty) {
      widget.onSendMessage(text);
      _controller.clear();
      setState(() => _hasText = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      color: AppColors.darkBackground,
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            // Expanded text input box
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                decoration: BoxDecoration(
                  color: AppColors.darkSurface,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusXLarge),
                  border: Border.all(color: AppColors.darkBorder, width: 0.6),
                ),
                child: Row(
                  children: [
                    // Emoji Picker Icon
                    IconButton(
                      icon: const Icon(Icons.emoji_emotions_outlined, color: AppColors.textSecondaryDark, size: 22),
                      onPressed: () {},
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        style: const TextStyle(color: AppColors.textPrimaryDark, fontSize: 15),
                        decoration: const InputDecoration(
                          hintText: 'Type a message...',
                          hintStyle: TextStyle(color: AppColors.textSecondaryDark, fontSize: 14),
                          border: InputBorder.none,
                          enabledBorder: InputBorder.none,
                          focusedBorder: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(vertical: 10),
                          isDense: true,
                        ),
                        maxLines: 4,
                        minLines: 1,
                        onChanged: (val) {
                          setState(() => _hasText = val.trim().isNotEmpty);
                          widget.onTyping?.call(val);
                        },
                      ),
                    ),
                    // Attachment Icon
                    IconButton(
                      icon: const Icon(Icons.attach_file_rounded, color: AppColors.textSecondaryDark, size: 22),
                      onPressed: widget.onAttachment,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                    const SizedBox(width: 8),
                    // Camera Icon
                    IconButton(
                      icon: const Icon(Icons.camera_alt_outlined, color: AppColors.textSecondaryDark, size: 22),
                      onPressed: widget.onCamera,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 6),

            // Send / Mic Circle Button
            GestureDetector(
              onTap: _hasText ? _handleSend : widget.onVoiceRecord,
              child: Container(
                width: 44,
                height: 44,
                decoration: const BoxDecoration(
                  color: AppColors.primaryGreen,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  _hasText ? Icons.send_rounded : Icons.mic_rounded,
                  color: Colors.white,
                  size: 22,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
