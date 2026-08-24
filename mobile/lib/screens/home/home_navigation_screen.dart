import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../widgets/common/bottom_nav_bar.dart';
import '../ai/meta_ai_screen.dart';
import '../call/calls_tab_screen.dart';
import '../settings/settings_screen.dart';
import '../status/status_screen.dart';
import 'chat_list_screen.dart';

class HomeNavigationScreen extends StatefulWidget {
  const HomeNavigationScreen({super.key});

  @override
  State<HomeNavigationScreen> createState() => _HomeNavigationScreenState();
}

class _HomeNavigationScreenState extends State<HomeNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    ChatListScreen(),
    CallsTabScreen(),
    StatusScreen(),
    MetaAIScreen(),
    SettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      extendBody: true,
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
    );
  }
}
