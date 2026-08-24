import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class StoryProgressBar extends StatelessWidget {
  final int count;
  final int currentIndex;
  final double currentProgress;

  const StoryProgressBar({
    super.key,
    required this.count,
    required this.currentIndex,
    required this.currentProgress,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(count, (index) {
        double fill = 0.0;
        if (index < currentIndex) {
          fill = 1.0;
        } else if (index == currentIndex) {
          fill = currentProgress.clamp(0.0, 1.0);
        }

        return Expanded(
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 2),
            height: 2.5,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.35),
              borderRadius: BorderRadius.circular(2),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: fill,
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
          ),
        );
      }),
    );
  }
}
