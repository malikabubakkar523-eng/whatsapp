import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../widgets/common/user_avatar.dart';

class SearchMessagesScreen extends StatefulWidget {
  const SearchMessagesScreen({super.key});

  @override
  State<SearchMessagesScreen> createState() => _SearchMessagesScreenState();
}

class _SearchMessagesScreenState extends State<SearchMessagesScreen> {
  final TextEditingController _searchController = TextEditingController(text: 'project');

  final List<Map<String, String>> _searchResults = const [
    {
      'name': 'Design Team',
      'message': 'The Project update is ready',
      'time': '9:45 AM',
      'avatar': '',
    },
    {
      'name': 'Michael Brown',
      'message': 'Project files attached',
      'time': 'Yesterday',
      'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    },
    {
      'name': 'Sarah Wilson',
      'message': "Let's discuss the project scope",
      'time': '2 days ago',
      'avatar': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    },
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        backgroundColor: AppColors.darkBackground,
        title: TextField(
          controller: _searchController,
          autofocus: true,
          style: const TextStyle(color: Colors.white, fontSize: 16),
          decoration: const InputDecoration(
            hintText: 'Search messages...',
            border: InputBorder.none,
            enabledBorder: InputBorder.none,
            focusedBorder: InputBorder.none,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: AppColors.primaryGreen, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
      body: ListView.builder(
        itemCount: _searchResults.length,
        itemBuilder: (context, index) {
          final item = _searchResults[index];
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
