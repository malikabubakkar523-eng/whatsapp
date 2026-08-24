import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../widgets/call/call_control_button.dart';

class VideoCallScreen extends StatefulWidget {
  final String participantName;
  final String? participantAvatar;
  final bool isVideo;

  const VideoCallScreen({
    super.key,
    required this.participantName,
    this.participantAvatar,
    this.isVideo = true,
  });

  @override
  State<VideoCallScreen> createState() => _VideoCallScreenState();
}

class _VideoCallScreenState extends State<VideoCallScreen> {
  int _seconds = 24;
  Timer? _timer;
  bool _isMuted = false;
  bool _isCameraOff = false;
  bool _isFrontCamera = true;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() => _seconds++);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _formatDuration(int sec) {
    final m = (sec ~/ 60).toString().padLeft(2, '0');
    final s = (sec % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Main Fullscreen Participant Video
          Positioned.fill(
            child: widget.isVideo && !_isCameraOff
                ? Image.network(
                    widget.participantAvatar ??
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000',
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      color: AppColors.darkBackground,
                      child: Center(
                        child: Text(
                          widget.participantName[0].toUpperCase(),
                          style: const TextStyle(fontSize: 72, color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  )
                : Container(
                    color: AppColors.darkBackground,
                    child: Center(
                      child: CircleAvatar(
                        radius: 60,
                        backgroundColor: AppColors.darkGreen,
                        child: Text(
                          widget.participantName[0].toUpperCase(),
                          style: const TextStyle(fontSize: 48, color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ),
          ),

          // Dark Gradient Overlays for Readability
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.black.withOpacity(0.6),
                    Colors.transparent,
                    Colors.black.withOpacity(0.75),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ),

          // Top Info: Back Button, Name & Duration
          Positioned(
            top: 50,
            left: 16,
            right: 16,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white, size: 32),
                  onPressed: () => Navigator.pop(context),
                ),
                Column(
                  children: [
                    Text(
                      widget.participantName,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _formatDuration(_seconds),
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.primaryGreen,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 48), // balance back button
              ],
            ),
          ),

          // Top-Right Small Picture-in-Picture (PIP) of Self
          if (widget.isVideo)
            Positioned(
              top: 110,
              right: 16,
              child: Container(
                width: 100,
                height: 140,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.6), width: 2),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.4), blurRadius: 10),
                  ],
                  image: const DecorationImage(
                    image: NetworkImage('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),

          // Bottom Floating Controls (Mute, Camera, Flip, End)
          Positioned(
            bottom: 40,
            left: 24,
            right: 24,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
              decoration: BoxDecoration(
                color: AppColors.darkSurface.withOpacity(0.85),
                borderRadius: BorderRadius.circular(32),
                border: Border.all(color: AppColors.darkBorder, width: 0.8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  CallControlButton(
                    icon: _isMuted ? Icons.mic_off_rounded : Icons.mic_rounded,
                    label: 'Mute',
                    isActive: _isMuted,
                    onTap: () => setState(() => _isMuted = !_isMuted),
                  ),
                  CallControlButton(
                    icon: _isCameraOff ? Icons.videocam_off_rounded : Icons.videocam_rounded,
                    label: 'Camera',
                    isActive: _isCameraOff,
                    onTap: () => setState(() => _isCameraOff = !_isCameraOff),
                  ),
                  CallControlButton(
                    icon: Icons.flip_camera_ios_rounded,
                    label: 'Flip',
                    onTap: () => setState(() => _isFrontCamera = !_isFrontCamera),
                  ),
                  CallControlButton(
                    icon: Icons.call_end_rounded,
                    label: 'End',
                    isEndCall: true,
                    onTap: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
