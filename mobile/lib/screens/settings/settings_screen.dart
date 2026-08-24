import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/user_avatar.dart';
import '../welcome/welcome_screen.dart';
import 'appearance_screen.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.currentUser;

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        title: const Text('Settings', style: TextStyle(fontWeight: FontWeight.w800)),
        backgroundColor: AppColors.darkBackground,
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        children: [
          // Profile Header Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.darkSurface,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
              border: Border.all(color: AppColors.darkBorder, width: 0.8),
            ),
            child: Row(
              children: [
                UserAvatar(
                  name: user?.profile.displayName ?? 'John Doe',
                  imageUrl: user?.profile.avatar,
                  radius: 30,
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user?.profile.displayName ?? 'John Doe',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        '@${user?.profile.username ?? "john_doe"}',
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.primaryGreen,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        user?.profile.bio ?? 'Hey there! I am using ChatFlow.',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondaryDark,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.qr_code_rounded, color: AppColors.primaryGreen),
                  onPressed: () {},
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Menu Options
          _buildSettingsGroup([
            _buildTile(
              icon: Icons.key_rounded,
              title: 'Account',
              onTap: () {},
            ),
            _buildTile(
              icon: Icons.lock_outline_rounded,
              title: 'Privacy',
              onTap: () {},
            ),
            _buildTile(
              icon: Icons.palette_outlined,
              title: 'Appearance',
              subtitle: 'Theme, wallpaper, colors',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const AppearanceScreen()),
                );
              },
            ),
            _buildTile(
              icon: Icons.chat_outlined,
              title: 'Chats',
              onTap: () {},
            ),
            _buildTile(
              icon: Icons.notifications_none_rounded,
              title: 'Notifications',
              onTap: () {},
            ),
            _buildTile(
              icon: Icons.data_usage_rounded,
              title: 'Storage and Data',
              onTap: () {},
            ),
          ]),

          const SizedBox(height: 16),

          _buildSettingsGroup([
            _buildTile(
              icon: Icons.help_outline_rounded,
              title: 'Help',
              onTap: () {},
            ),
            _buildTile(
              icon: Icons.group_add_outlined,
              title: 'Invite a Friend',
              onTap: () {},
            ),
          ]),

          const SizedBox(height: 16),

          // Logout Button Tile
          Container(
            decoration: BoxDecoration(
              color: AppColors.darkSurface,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
              border: Border.all(color: AppColors.darkBorder, width: 0.8),
            ),
            child: ListTile(
              leading: const Icon(Icons.logout_rounded, color: AppColors.errorRed),
              title: const Text(
                'Logout',
                style: TextStyle(
                  color: AppColors.errorRed,
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                ),
              ),
              onTap: () async {
                await auth.logout();
                if (context.mounted) {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const WelcomeScreen()),
                    (route) => false,
                  );
                }
              },
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildSettingsGroup(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.darkSurface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
        border: Border.all(color: AppColors.darkBorder, width: 0.8),
      ),
      child: Column(
        children: children,
      ),
    );
  }

  Widget _buildTile({
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppColors.textSecondaryDark, size: 22),
      title: Text(
        title,
        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: Colors.white),
      ),
      subtitle: subtitle != null
          ? Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark))
          : null,
      trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textSecondaryDark, size: 20),
      onTap: onTap,
    );
  }
}
