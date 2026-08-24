import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class TypingDotsIndicator extends StatefulWidget {
  const TypingDotsIndicator({super.key});

  @override
  State<TypingDotsIndicator> createState() => _TypingDotsIndicatorState();
}

class _TypingDotsIndicatorState extends State<TypingDotsIndicator> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (index) {
            final delay = index * 0.2;
            final val = (_controller.value + delay) % 1.0;
            final scale = (0.5 + (0.5 * (1 - (val - 0.5).abs() * 2))).clamp(0.5, 1.0);

            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 2),
              width: 6,
              height: 6,
              transform: Matrix4.diagonal3Values(scale, scale, 1.0),
              decoration: const BoxDecoration(
                color: AppColors.primaryGreen,
                shape: BoxShape.circle,
              ),
            );
          }),
        );
      },
    );
  }
}
