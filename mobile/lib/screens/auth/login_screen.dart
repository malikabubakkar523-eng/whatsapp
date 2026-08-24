import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/custom_text_field.dart';
import '../../widgets/common/primary_button.dart';
import '../home/home_navigation_screen.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    final username = _usernameController.text.trim();
    final password = _passwordController.text.trim();

    if (username.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields')),
      );
      return;
    }

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final success = await auth.login(username, password);

    if (success && mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const HomeNavigationScreen()),
        (route) => false,
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(auth.errorMessage ?? 'Login failed')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 10),
              const Text(
                'Welcome Back 👋',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Login to continue your journey',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondaryDark,
                ),
              ),
              const SizedBox(height: 32),

              // Username Field
              const Text(
                'Username or Email',
                style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 13, fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 6),
              CustomTextField(
                controller: _usernameController,
                hintText: 'john_doe',
                prefixIcon: Icons.person_outline_rounded,
              ),
              const SizedBox(height: 20),

              // Password Field
              const Text(
                'Password',
                style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 13, fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 6),
              CustomTextField(
                controller: _passwordController,
                hintText: '••••••••',
                obscureText: _obscurePassword,
                prefixIcon: Icons.lock_outline_rounded,
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                    color: AppColors.textSecondaryDark,
                    size: 20,
                  ),
                  onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                ),
              ),

              // Forgot password link
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () {},
                  child: const Text(
                    'Forgot Password?',
                    style: TextStyle(
                      color: AppColors.primaryGreen,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Login Button
              PrimaryButton(
                text: 'Login',
                isLoading: auth.isLoading,
                onPressed: _handleLogin,
              ),
              const SizedBox(height: 28),

              // Or continue with
              Row(
                children: [
                  const Expanded(child: Divider(color: AppColors.darkBorder)),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'or continue with',
                      style: TextStyle(color: AppColors.textSecondaryDark.withOpacity(0.8), fontSize: 12),
                    ),
                  ),
                  const Expanded(child: Divider(color: AppColors.darkBorder)),
                ],
              ),
              const SizedBox(height: 24),

              // Social Row (Google, Apple, Facebook)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildSocialButton(Icons.g_mobiledata_rounded, 'Google', Colors.white),
                  const SizedBox(width: 16),
                  _buildSocialButton(Icons.apple_rounded, 'Apple', Colors.white),
                  const SizedBox(width: 16),
                  _buildSocialButton(Icons.facebook_rounded, 'Facebook', AppColors.facebookBlue),
                ],
              ),
              const SizedBox(height: 36),

              // Register Footer link
              Center(
                child: GestureDetector(
                  onTap: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (_) => const RegisterScreen()),
                    );
                  },
                  child: RichText(
                    text: const TextSpan(
                      style: TextStyle(fontSize: 14, color: AppColors.textSecondaryDark),
                      children: [
                        TextSpan(text: "Don't have an account? "),
                        TextSpan(
                          text: 'Register',
                          style: TextStyle(color: AppColors.primaryGreen, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSocialButton(IconData icon, String label, Color iconColor) {
    return Container(
      width: 52,
      height: 52,
      decoration: BoxDecoration(
        color: AppColors.darkSurface,
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.darkBorder, width: 0.8),
      ),
      child: Center(
        child: Icon(icon, color: iconColor, size: 28),
      ),
    );
  }
}
