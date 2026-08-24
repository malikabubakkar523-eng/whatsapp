import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';
import '../../widgets/common/chatflow_logo.dart';
import '../../widgets/common/primary_button.dart';
import '../../widgets/common/secondary_button.dart';
import '../auth/login_screen.dart';
import '../auth/register_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Top Brand & Title
              Column(
                children: [
                  const SizedBox(height: 20),
                  const ChatFlowLogo(size: 68),
                  const SizedBox(height: 16),
                  const Text(
                    'ChatFlow',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  RichText(
                    textAlign: TextAlign.center,
                    text: const TextSpan(
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                      children: [
                        TextSpan(text: 'Connect. Share. '),
                        TextSpan(
                          text: 'Flow.',
                          style: TextStyle(color: AppColors.primaryGreen, fontWeight: FontWeight.w800),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'A fast, secure & beautiful way\nto connect with everyone.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondaryDark,
                      height: 1.4,
                    ),
                  ),
                ],
              ),

              // Center Visual with Avatars Cluster
              Stack(
                alignment: Alignment.center,
                children: [
                  // Atmospheric green glow
                  Container(
                    width: 220,
                    height: 220,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.primaryGreen.withOpacity(0.08),
                    ),
                  ),
                  // Center User Circle
                  Container(
                    width: 170,
                    height: 170,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.primaryGreen.withOpacity(0.4), width: 3),
                      image: const DecorationImage(
                        image: NetworkImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  // Orbiting Avatar Left
                  Positioned(
                    top: 15,
                    left: 20,
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                        image: const DecorationImage(
                          image: NetworkImage('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  ),
                  // Orbiting Avatar Right
                  Positioned(
                    top: 15,
                    right: 20,
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                        image: const DecorationImage(
                          image: NetworkImage('https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200'),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              // Bottom Actions
              Column(
                children: [
                  PrimaryButton(
                    text: 'Get Started',
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const RegisterScreen()),
                      );
                    },
                  ),
                  const SizedBox(height: 12),
                  SecondaryButton(
                    text: 'Login',
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const LoginScreen()),
                      );
                    },
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'By continuing, you agree to our\nTerms & Privacy Policy',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondaryDark,
                      height: 1.3,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
