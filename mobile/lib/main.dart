import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/calls_provider.dart';
import 'providers/chat_provider.dart';
import 'providers/status_provider.dart';
import 'providers/theme_provider.dart';
import 'screens/home/home_navigation_screen.dart';
import 'screens/welcome/welcome_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ChatProvider()),
        ChangeNotifierProvider(create: (_) => CallsProvider()),
        ChangeNotifierProvider(create: (_) => StatusProvider()),
      ],
      child: const ChatFlowApp(),
    ),
  );
}

class ChatFlowApp extends StatelessWidget {
  const ChatFlowApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);

    return MaterialApp(
      title: 'ChatFlow',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeProvider.themeMode,
      home: authProvider.isLoading
          ? const Scaffold(
              backgroundColor: Color(0xFF111B21),
              body: Center(
                child: CircularProgressIndicator(color: Color(0xFF25D366)),
              ),
            )
          : authProvider.isAuthenticated
              ? const HomeNavigationScreen()
              : const WelcomeScreen(),
    );
  }
}
