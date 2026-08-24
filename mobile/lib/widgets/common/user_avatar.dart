import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class UserAvatar extends StatelessWidget {
  final String? imageUrl;
  final String name;
  final double radius;
  final bool isOnline;
  final bool showOnlineBadge;

  const UserAvatar({
    super.key,
    this.imageUrl,
    required this.name,
    this.radius = 24,
    this.isOnline = false,
    this.showOnlineBadge = false,
  });

  String _getInitials(String name) {
    if (name.isEmpty) return 'U';
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.substring(0, name.length >= 2 ? 2 : 1).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        CircleAvatar(
          radius: radius,
          backgroundColor: AppColors.darkGreen,
          backgroundImage: imageUrl != null && imageUrl!.isNotEmpty
              ? NetworkImage(imageUrl!)
              : null,
          child: imageUrl == null || imageUrl!.isEmpty
              ? Text(
                  _getInitials(name),
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: radius * 0.75,
                  ),
                )
              : null,
        ),
        if (showOnlineBadge && isOnline)
          Positioned(
            right: 0,
            bottom: 0,
            child: Container(
              width: radius * 0.55,
              height: radius * 0.55,
              decoration: BoxDecoration(
                color: AppColors.onlineGreen,
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.darkBackground, width: 2),
              ),
            ),
          ),
      ],
    );
  }
}
