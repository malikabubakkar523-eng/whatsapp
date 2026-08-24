import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';
import '../../providers/theme_provider.dart';

class AppearanceScreen extends StatelessWidget {
  const AppearanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        title: const Text('Appearance', style: TextStyle(fontWeight: FontWeight.w800)),
        backgroundColor: AppColors.darkBackground,
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        children: [
          // Theme Group
          const Text(
            'Theme',
            style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(
              color: AppColors.darkSurface,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
              border: Border.all(color: AppColors.darkBorder, width: 0.8),
            ),
            child: Column(
              children: [
                RadioListTile<ThemeMode>(
                  value: ThemeMode.system,
                  groupValue: themeProvider.themeMode,
                  activeColor: AppColors.primaryGreen,
                  title: const Text('System', style: TextStyle(color: Colors.white, fontSize: 15)),
                  onChanged: (mode) => themeProvider.setThemeMode(mode!),
                ),
                const Divider(color: AppColors.darkBorder, height: 1),
                RadioListTile<ThemeMode>(
                  value: ThemeMode.light,
                  groupValue: themeProvider.themeMode,
                  activeColor: AppColors.primaryGreen,
                  title: const Text('Light', style: TextStyle(color: Colors.white, fontSize: 15)),
                  onChanged: (mode) => themeProvider.setThemeMode(mode!),
                ),
                const Divider(color: AppColors.darkBorder, height: 1),
                RadioListTile<ThemeMode>(
                  value: ThemeMode.dark,
                  groupValue: themeProvider.themeMode,
                  activeColor: AppColors.primaryGreen,
                  title: const Text('Dark', style: TextStyle(color: Colors.white, fontSize: 15)),
                  onChanged: (mode) => themeProvider.setThemeMode(mode!),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Customization Options
          Container(
            decoration: BoxDecoration(
              color: AppColors.darkSurface,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
              border: Border.all(color: AppColors.darkBorder, width: 0.8),
            ),
            child: Column(
              children: [
                ListTile(
                  title: const Text('Chat Wallpaper', style: TextStyle(color: Colors.white, fontSize: 15)),
                  trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textSecondaryDark),
                  onTap: () {},
                ),
                const Divider(color: AppColors.darkBorder, height: 1),
                ListTile(
                  title: const Text('App Icon', style: TextStyle(color: Colors.white, fontSize: 15)),
                  trailing: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Default', style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 13)),
                      SizedBox(width: 4),
                      Icon(Icons.chevron_right_rounded, color: AppColors.textSecondaryDark),
                    ],
                  ),
                  onTap: () {},
                ),
                const Divider(color: AppColors.darkBorder, height: 1),
                ListTile(
                  title: const Text('Color Accent', style: TextStyle(color: Colors.white, fontSize: 15)),
                  trailing: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Green', style: TextStyle(color: AppColors.primaryGreen, fontSize: 13, fontWeight: FontWeight.bold)),
                      SizedBox(width: 4),
                      Icon(Icons.chevron_right_rounded, color: AppColors.textSecondaryDark),
                    ],
                  ),
                  onTap: () {},
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),

          // Live Bubble Preview Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.darkChatBackground,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
              border: Border.all(color: AppColors.darkBorder, width: 0.8),
            ),
            child: Column(
              children: [
                Align(
                  alignment: Alignment.centerLeft,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.darkIncomingBubble,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Text('Hello! 👋', style: TextStyle(color: Colors.white, fontSize: 14)),
                  ),
                ),
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerRight,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.darkOutgoingBubble,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Text('Hi there! ✨', style: TextStyle(color: Colors.white, fontSize: 14)),
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
