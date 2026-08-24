import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../widgets/common/user_avatar.dart';

class NewChatScreen extends StatelessWidget {
  const NewChatScreen({super.key});

  final List<Map<String, String>> _frequentContacts = const [
    {
      'name': 'Emma Watson',
      'username': 'emma_watson',
      'bio': 'Hey there! I am using ChatFlow.',
      'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    },
    {
      'name': 'Michael Brown',
      'username': 'michael_b',
      'bio': 'Available',
      'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    },
    {
      'name': 'Sarah Wilson',
      'username': 'sarah_w',
      'bio': 'At the gym',
      'avatar': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    },
    {
      'name': 'James Taylor',
      'username': 'james_t',
      'bio': 'Busy',
      'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    },
    {
      'name': 'Olivia Martin',
      'username': 'olivia_m',
      'bio': 'Hey there! I am using ChatFlow.',
      'avatar': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        title: const Text('New Chat', style: TextStyle(fontWeight: FontWeight.w800)),
        backgroundColor: AppColors.darkBackground,
      ),
      body: ListView(
        children: [
          // Action Buttons: New Group, New Contact, New Community
          ListTile(
            leading: _buildActionIcon(Icons.group_add_rounded),
            title: const Text('New Group', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
            onTap: () {},
          ),
          ListTile(
            leading: _buildActionIcon(Icons.person_add_alt_1_rounded),
            title: const Text('New Contact', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
            onTap: () {},
          ),
          ListTile(
            leading: _buildActionIcon(Icons.groups_rounded),
            title: const Text('New Community', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
            onTap: () {},
          ),
          const Divider(color: AppColors.darkBorder, height: 20),

          // Section Title: Frequently Contacted
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Text(
              'Frequently Contacted',
              style: TextStyle(
                color: AppColors.textSecondaryDark,
                fontSize: 12.5,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),

          // Frequently Contacted List
          ..._frequentContacts.map(
            (c) => ListTile(
              leading: UserAvatar(
                name: c['name']!,
                imageUrl: c['avatar'],
                radius: 22,
              ),
              title: Text(
                c['name']!,
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white),
              ),
              subtitle: Text(
                c['bio']!,
                style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondaryDark),
              ),
              onTap: () => Navigator.pop(context),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionIcon(IconData icon) {
    return Container(
      width: 44,
      height: 44,
      decoration: const BoxDecoration(
        color: AppColors.primaryGreen,
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: Colors.white, size: 22),
    );
  }
}
