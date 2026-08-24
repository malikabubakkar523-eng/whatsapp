import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/custom_text_field.dart';
import '../../widgets/common/primary_button.dart';
import '../home/home_navigation_screen.dart';
import 'login_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _displayNameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _usernameController.dispose();
    _displayNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleRegister() async {
    final username = _usernameController.text.trim();
    final displayName = _displayNameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (username.isEmpty || displayName.isEmpty || email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields')),
      );
      return;
    }

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final success = await auth.register(
      username: username,
      displayName: displayName,
      email: email,
      password: password,
    );

    if (success && mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const HomeNavigationScreen()),
        (route) => false,
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(auth.errorMessage ?? 'Registration failed')),
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
              const Text(
                'Create Account ✨',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Claim your unique @username on ChatFlow',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondaryDark,
                ),
              ),
              const SizedBox(height: 28),

              // Username Field
              const Text(
                'Username (@handle)',
                style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 13, fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 6),
              CustomTextField(
                controller: _usernameController,
                hintText: 'emma_watson',
                prefixIcon: Icons.alternate_email_rounded,
              ),
              const SizedBox(height: 16),

              // Display Name Field
              const Text(
                'Display Name',
                style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 13, fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 6),
              CustomTextField(
                controller: _displayNameController,
                hintText: 'Emma Watson',
                prefixIcon: Icons.badge_outlined,
              ),
              const SizedBox(height: 16),

              // Email Field
              const Text(
                'Email Address',
                style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 13, fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 6),
              CustomTextField(
                controller: _emailController,
                hintText: 'emma@example.com',
                keyboardType: TextInputType.emailAddress,
                prefixIcon: Icons.email_outlined,
              ),
              const SizedBox(height: 16),

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
              const SizedBox(height: 28),

              // Register Button
              PrimaryButton(
                text: 'Create Account',
                isLoading: auth.isLoading,
                onPressed: _handleRegister,
              ),
              const SizedBox(height: 24),

              // Login Footer link
              Center(
                child: GestureDetector(
                  onTap: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                    );
                  },
                  child: RichText(
                    text: const TextSpan(
                      style: TextStyle(fontSize: 14, color: AppColors.textSecondaryDark),
                      children: [
                        TextSpan(text: 'Already have an account? '),
                        TextSpan(
                          text: 'Login',
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
}
