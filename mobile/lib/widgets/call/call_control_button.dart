import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class CallControlButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool isEndCall;
  final bool isActive;

  const CallControlButton({
    super.key,
    required this.icon,
    required this.label,
    required this.onTap,
    this.isEndCall = false,
    this.isActive = false,
  });

  @override
  Widget build(BuildContext context) {
    Color bg = AppColors.darkSurface.withOpacity(0.85);
    Color iconColor = Colors.white;

    if (isEndCall) {
      bg = AppColors.errorRed;
    } else if (isActive) {
      bg = Colors.white;
      iconColor = Colors.black;
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        GestureDetector(
          onTap: onTap,
          child: Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: bg,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.3),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(icon, color: iconColor, size: 24),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
