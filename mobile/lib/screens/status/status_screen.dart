import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../models/status_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/status_provider.dart';
import '../../widgets/status/story_circle_avatar.dart';
import 'status_viewer_screen.dart';

class StatusScreen extends StatelessWidget {
  const StatusScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final statusProvider = Provider.of<StatusProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.currentUser;
    final updates = statusProvider.recentUpdates;

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        title: const Text('Status', style: TextStyle(fontWeight: FontWeight.w800)),
        backgroundColor: AppColors.darkBackground,
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert_rounded, color: Colors.white, size: 22),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        children: [
          // My Status Tile
          ListTile(
            leading: StoryCircleAvatar(
              name: user?.profile.displayName ?? 'Me',
              imageUrl: user?.profile.avatar,
              isAddStory: true,
              onTap: () {},
            ),
            title: const Text(
              'My Status',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            subtitle: const Text(
              'Tap to add status update',
              style: TextStyle(fontSize: 13, color: AppColors.textSecondaryDark),
            ),
          ),
          const Divider(color: AppColors.darkBorder, height: 20),

          // Section Title: Recent Updates
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 6.0),
            child: Text(
              'Recent updates',
              style: TextStyle(
                color: AppColors.textSecondaryDark,
                fontSize: 12.5,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),

          // Recent Status List
          ...updates.map(
            (status) => ListTile(
              leading: StoryCircleAvatar(
                name: status.userName,
                imageUrl: status.userAvatar,
                isViewed: status.isViewed,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => StatusViewerScreen(status: status),
                    ),
                  );
                },
              ),
              title: Text(
                status.userName,
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white),
              ),
              subtitle: Text(
                'Today, ${status.createdAt.hour}:${status.createdAt.minute.toString().padLeft(2, '0')} AM',
                style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondaryDark),
              ),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => StatusViewerScreen(status: status),
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          FloatingActionButton.small(
            heroTag: 'edit_status',
            backgroundColor: AppColors.darkSurface,
            foregroundColor: Colors.white,
            onPressed: () {},
            child: const Icon(Icons.edit_rounded, size: 20),
          ),
          const SizedBox(height: 12),
          FloatingActionButton(
            heroTag: 'camera_status',
            backgroundColor: AppColors.primaryGreen,
            foregroundColor: Colors.white,
            onPressed: () {},
            child: const Icon(Icons.camera_alt_rounded),
          ),
        ],
      ),
    );
  }
}
