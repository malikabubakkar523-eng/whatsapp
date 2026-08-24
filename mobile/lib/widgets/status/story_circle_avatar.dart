import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class StoryCircleAvatar extends StatelessWidget {
  final String? imageUrl;
  final String name;
  final bool isViewed;
  final bool isAddStory;
  final VoidCallback onTap;
  final double radius;

  const StoryCircleAvatar({
    super.key,
    this.imageUrl,
    required this.name,
    this.isViewed = false,
    this.isAddStory = false,
    required this.onTap,
    this.radius = 28,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(2.5),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: isViewed
                ? AppColors.textSecondaryDark
                : (isAddStory ? Colors.transparent : AppColors.primaryGreen),
            width: 2.2,
          ),
        ),
        child: Stack(
          children: [
            CircleAvatar(
              radius: radius,
              backgroundColor: AppColors.darkSurface,
              backgroundImage: imageUrl != null && imageUrl!.isNotEmpty
                  ? NetworkImage(imageUrl!)
                  : null,
              child: imageUrl == null || imageUrl!.isEmpty
                  ? Text(
                      name.isNotEmpty ? name[0].toUpperCase() : 'U',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: radius * 0.8,
                      ),
                    )
                  : null,
            ),
            if (isAddStory)
              Positioned(
                right: 0,
                bottom: 0,
                child: Container(
                  padding: const EdgeInsets.all(2),
                  decoration: const BoxDecoration(
                    color: AppColors.primaryGreen,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.add, color: Colors.white, size: 14),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
