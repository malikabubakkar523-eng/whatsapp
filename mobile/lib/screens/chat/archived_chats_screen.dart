import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../widgets/common/user_avatar.dart';

class ArchivedChatsScreen extends StatelessWidget {
  const ArchivedChatsScreen({super.key});

  final List<Map<String, String>> _archivedItems = const [
    {
      'name': 'Old Friends',
      'message': 'You: See you soon',
      'time': '10/01/24',
      'avatar': '',
    },
    {
      'name': 'College Group',
      'message': 'You: Thanks everyone',
      'time': '08/05/24',
      'avatar': '',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        title: const Text('Archived Chats', style: TextStyle(fontWeight: FontWeight.w800)),
        backgroundColor: AppColors.darkBackground,
      ),
      body: ListView.builder(
        itemCount: _archivedItems.length,
        itemBuilder: (context, index) {
          final item = _archivedItems[index];
          return ListTile(
            leading: UserAvatar(name: item['name']!, imageUrl: item['avatar']),
            title: Text(item['name']!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
            subtitle: Text(item['message']!, style: const TextStyle(color: AppColors.textSecondaryDark)),
            trailing: Text(item['time']!, style: const TextStyle(color: AppColors.textSecondaryDark, fontSize: 11)),
            onTap: () => Navigator.pop(context),
          );
        },
      ),
    );
  }
}
