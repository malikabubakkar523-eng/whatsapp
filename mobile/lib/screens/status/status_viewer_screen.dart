import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/status_model.dart';
import '../../widgets/common/user_avatar.dart';
import '../../widgets/status/story_progress_bar.dart';

class StatusViewerScreen extends StatefulWidget {
  final StatusModel status;

  const StatusViewerScreen({
    super.key,
    required this.status,
  });

  @override
  State<StatusViewerScreen> createState() => _StatusViewerScreenState();
}

class _StatusViewerScreenState extends State<StatusViewerScreen> {
  double _progress = 0.0;
  Timer? _timer;
  bool _isLiked = false;

  @override
  void initState() {
    super.initState();
    _startStoryTimer();
  }

  void _startStoryTimer() {
    _timer = Timer.periodic(const Duration(milliseconds: 50), (timer) {
      setState(() {
        _progress += 0.01;
        if (_progress >= 1.0) {
          _timer?.cancel();
          Navigator.pop(context);
        }
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Background Image or Text Gradient
          Positioned.fill(
            child: widget.status.mediaUrl != null
                ? Image.network(
                    widget.status.mediaUrl!,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      color: AppColors.darkGreen,
                      child: Center(
                        child: Text(
                          widget.status.textContent ?? '',
                          style: const TextStyle(fontSize: 22, color: Colors.white, fontWeight: FontWeight.bold),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                  )
                : Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF00A884), Color(0xFF128C7E)],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                    child: Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32.0),
                        child: Text(
                          widget.status.textContent ?? '',
                          style: const TextStyle(
                            fontSize: 26,
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                  ),
          ),

          // Top Header & Progress Bar
          Positioned(
            top: 44,
            left: 12,
            right: 12,
            child: Column(
              children: [
                StoryProgressBar(
                  count: 1,
                  currentIndex: 0,
                  currentProgress: _progress,
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                    UserAvatar(
                      name: widget.status.userName,
                      imageUrl: widget.status.userAvatar,
                      radius: 18,
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.status.userName,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Today, ${widget.status.createdAt.hour}:${widget.status.createdAt.minute.toString().padLeft(2, '0')} AM',
                          style: const TextStyle(color: Colors.white70, fontSize: 11),
                        ),
                      ],
                    ),
                    const Spacer(),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Bottom Reply Bar + Reaction
          Positioned(
            bottom: 24,
            left: 16,
            right: 16,
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    height: 48,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.55),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.white24, width: 0.8),
                    ),
                    child: const Row(
                      children: [
                        Text(
                          'Reply...',
                          style: TextStyle(color: Colors.white70, fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                GestureDetector(
                  onTap: () => setState(() => _isLiked = !_isLiked),
                  child: Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.55),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white24, width: 0.8),
                    ),
                    child: Icon(
                      _isLiked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                      color: _isLiked ? AppColors.errorRed : Colors.white,
                      size: 24,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
