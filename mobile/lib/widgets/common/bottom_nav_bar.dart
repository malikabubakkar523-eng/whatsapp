import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class BottomNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final VoidCallback onNewChat;

  const BottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.onNewChat,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.darkBackground,
        border: Border(top: BorderSide(color: AppColors.darkBorder, width: 0.6)),
      ),
      padding: const EdgeInsets.only(top: 8, bottom: 12),
      child: SafeArea(
        top: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildNavItem(
              index: 0,
              icon: Icons.chat_bubble_rounded,
              label: 'Chats',
            ),
            _buildNavItem(
              index: 1,
              icon: Icons.phone_rounded,
              label: 'Calls',
            ),
            // Center Floating Action Button
            GestureDetector(
              onTap: onNewChat,
              child: Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primaryGreen.withOpacity(0.4),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: const Icon(Icons.add, color: Colors.white, size: 28),
              ),
            ),
            _buildNavItem(
              index: 2,
              icon: Icons.donut_large_rounded,
              label: 'Status',
            ),
            _buildNavItem(
              index: 3,
              icon: Icons.settings_rounded,
              label: 'Settings',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required IconData icon,
    required String label,
  }) {
    final isSelected = currentIndex == index;
    return GestureDetector(
      onTap: () => onTap(index),
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 24,
            color: isSelected ? AppColors.primaryGreen : AppColors.textSecondaryDark,
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              color: isSelected ? AppColors.primaryGreen : AppColors.textSecondaryDark,
            ),
          ),
        ],
      ),
    );
  }
}
