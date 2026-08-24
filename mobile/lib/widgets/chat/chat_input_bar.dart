import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';

class ChatInputBar extends StatefulWidget {
  final Function(String) onSendMessage;
  final VoidCallback? onAttachment;
  final VoidCallback? onCamera;
  final VoidCallback? onVoiceRecord;

  const ChatInputBar({
    super.key,
    required this.onSendMessage,
    this.onAttachment,
    this.onCamera,
    this.onVoiceRecord,
  });

  @override
  State<ChatInputBar> createState() => _ChatInputBarState();
}

class _ChatInputBarState extends State<ChatInputBar> {
  final TextEditingController _controller = TextEditingController();
  bool _isComposing = false;

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
      setState(() => _isComposing = false);
    }
  }

  void _showAttachmentBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.darkSurfaceElevated,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          border: Border.all(color: AppColors.darkBorder, width: 0.8),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(
                color: AppColors.textSecondaryDark.withOpacity(0.4),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildAttachmentOption(Icons.camera_alt_rounded, 'Camera', const Color(0xFF00A884), () => Navigator.pop(context)),
                _buildAttachmentOption(Icons.image_rounded, 'Gallery', const Color(0xFF9333EA), () => Navigator.pop(context)),
                _buildAttachmentOption(Icons.insert_drive_file_rounded, 'Document', const Color(0xFF53BDEB), () => Navigator.pop(context)),
                _buildAttachmentOption(Icons.headset_rounded, 'Audio', const Color(0xFFFF9800), () => Navigator.pop(context)),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildAttachmentOption(Icons.location_on_rounded, 'Location', const Color(0xFF10B981), () => Navigator.pop(context)),
                _buildAttachmentOption(Icons.person_rounded, 'Contact', const Color(0xFF0284C7), () => Navigator.pop(context)),
                _buildAttachmentOption(Icons.poll_rounded, 'Poll', const Color(0xFFE11D48), () => Navigator.pop(context)),
                const SizedBox(width: 60), // balance row
              ],
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  Widget _buildAttachmentOption(IconData icon, String label, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: color.withOpacity(0.18),
              shape: BoxShape.circle,
              border: Border.all(color: color.withOpacity(0.4), width: 1),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.darkBackground.withOpacity(0.92),
          border: Border(top: BorderSide(color: AppColors.darkBorder.withOpacity(0.6), width: 0.8)),
        ),
        child: Row(
          children: [
            // Glass Input Container
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: AppColors.darkSurface,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.darkBorder, width: 0.8),
                ),
                child: Row(
                  children: [
                    // Emoji Button
                    IconButton(
                      icon: const Icon(Icons.emoji_emotions_outlined, color: AppColors.textSecondaryDark, size: 22),
                      onPressed: () {},
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                    const SizedBox(width: 8),

                    // Text Field
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        style: const TextStyle(color: Colors.white, fontSize: 14.5),
                        maxLines: 4,
                        minLines: 1,
                        textInputAction: TextInputAction.send,
                        onSubmitted: (_) => _handleSend(),
                        onChanged: (text) {
                          setState(() {
                            _isComposing = text.trim().isNotEmpty;
                          });
                        },
                        decoration: const InputDecoration(
                          hintText: 'Message...',
                          hintStyle: TextStyle(color: AppColors.textSecondaryDark, fontSize: 14.5),
                          border: InputBorder.none,
                          isDense: true,
                          contentPadding: EdgeInsets.symmetric(vertical: 10),
                        ),
                      ),
                    ),

                    // Attachment Button
                    IconButton(
                      icon: const Icon(Icons.attach_file_rounded, color: AppColors.textSecondaryDark, size: 22),
                      onPressed: () => _showAttachmentBottomSheet(context),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                    const SizedBox(width: 8),

                    // Camera Button
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
            const SizedBox(width: 8),

            // Send or Mic Action Button
            GestureDetector(
              onTap: _isComposing ? _handleSend : widget.onVoiceRecord,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                width: 44,
                height: 44,
                decoration: const BoxDecoration(
                  color: AppColors.primaryGreen,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Color(0x4025D366),
                      blurRadius: 10,
                      offset: Offset(0, 3),
                    ),
                  ],
                ),
                child: Icon(
                  _isComposing ? Icons.send_rounded : Icons.mic_rounded,
                  color: Colors.white,
                  size: 20,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
