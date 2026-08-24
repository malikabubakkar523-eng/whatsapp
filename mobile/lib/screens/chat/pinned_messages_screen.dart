import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../widgets/common/user_avatar.dart';

class PinnedMessagesScreen extends StatelessWidget {
  const PinnedMessagesScreen({super.key});

  final List<Map<String, String>> _pinnedItems = const [
    {
      'name': 'Emma Watson',
      'message': 'Please review the designs',
      'time': '9:30 AM',
      'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    },
    {
      'name': 'Design Team',
      'message': 'Final mockup is ready',
      'time': 'Yesterday',
      'avatar': '',
    },
    {
      'name': 'John Doe',
      'message': 'Important meeting tomorrow',
      'time': 'Yesterday',
      'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        title: const Text('Pinned Messages', style: TextStyle(fontWeight: FontWeight.w800)),
        backgroundColor: AppColors.darkBackground,
      ),
      body: ListView.builder(
        itemCount: _pinnedItems.length,
        itemBuilder: (context, index) {
          final item = _pinnedItems[index];
          return ListTile(
            leading: UserAvatar(name: item['name']!, imageUrl: item['avatar']),
            title: Text(item['name']!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
            subtitle: Text(item['message']!, style: const TextStyle(color: AppColors.textSecondaryDark)),
            trailing: const Icon(Icons.push_pin_rounded, color: AppColors.primaryGreen, size: 18),
            onTap: () => Navigator.pop(context),
          );
        },
      ),
    );
  }
}
