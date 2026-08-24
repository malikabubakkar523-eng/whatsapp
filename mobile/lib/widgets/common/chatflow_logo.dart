import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class ChatFlowLogo extends StatelessWidget {
  final double size;
  final bool showText;

  const ChatFlowLogo({
    super.key,
    this.size = 48,
    this.showText = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: AppColors.primaryGreen,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppColors.primaryGreen.withOpacity(0.35),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Center(
            child: Icon(
              Icons.chat_bubble_rounded,
              color: Colors.white,
              size: size * 0.55,
            ),
          ),
        ),
        if (showText) ...[
          const SizedBox(width: 12),
          RichText(
            text: const TextSpan(
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimaryDark,
                letterSpacing: -0.5,
              ),
              children: [
                TextSpan(text: 'Chat'),
                TextSpan(
                  text: 'Flow',
                  style: TextStyle(color: AppColors.primaryGreen),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}
