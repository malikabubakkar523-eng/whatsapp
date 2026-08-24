import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/message_model.dart';
import 'message_ticks.dart';

class VoiceMessagePlayer extends StatefulWidget {
  final MessageModel message;
  final bool isMine;

  const VoiceMessagePlayer({
    super.key,
    required this.message,
    required this.isMine,
  });

  @override
  State<VoiceMessagePlayer> createState() => _VoiceMessagePlayerState();
}

class _VoiceMessagePlayerState extends State<VoiceMessagePlayer> {
  bool isPlaying = false;
  double progress = 0.35;

  final List<double> waveformHeights = [
    0.4, 0.7, 0.9, 0.6, 0.3, 0.8, 1.0, 0.5, 0.65, 0.85, 0.45, 0.95, 0.3, 0.7, 0.5, 0.8, 0.6
  ];

  @override
  Widget build(BuildContext context) {
    final bubbleColor = widget.isMine ? AppColors.darkOutgoingBubble : AppColors.darkIncomingBubble;
    final waveColor = widget.isMine ? AppColors.primaryGreen : AppColors.textPrimaryDark;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: bubbleColor,
        borderRadius: BorderRadius.only(
          topLeft: const Radius.circular(16),
          topRight: const Radius.circular(16),
          bottomLeft: Radius.circular(widget.isMine ? 16 : 4),
          bottomRight: Radius.circular(widget.isMine ? 4 : 16),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Play/Pause button
          GestureDetector(
            onTap: () {
              setState(() {
                isPlaying = !isPlaying;
              });
            },
            child: Container(
              width: 38,
              height: 38,
              decoration: const BoxDecoration(
                color: AppColors.primaryGreen,
                shape: BoxShape.circle,
              ),
              child: Icon(
                isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                color: Colors.white,
                size: 22,
              ),
            ),
          ),
          const SizedBox(width: 10),

          // Waveform & Timers
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: waveformHeights.asMap().entries.map((entry) {
                  final index = entry.key;
                  final heightRatio = entry.value;
                  final isPlayed = index / waveformHeights.length <= progress;

                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 1.5),
                    width: 3,
                    height: 24 * heightRatio,
                    decoration: BoxDecoration(
                      color: isPlayed ? waveColor : waveColor.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    '0:14',
                    style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 11),
                  ),
                  const SizedBox(width: 32),
                  Text(
                    '${widget.message.createdAt.hour}:${widget.message.createdAt.minute.toString().padLeft(2, '0')}',
                    style: const TextStyle(color: AppColors.textSecondaryDark, fontSize: 10),
                  ),
                  if (widget.isMine) ...[
                    const SizedBox(width: 4),
                    MessageTicks(status: widget.message.status, size: 12),
                  ],
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
