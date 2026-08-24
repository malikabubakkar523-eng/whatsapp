import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';
import '../../widgets/common/chatflow_logo.dart';
import '../../widgets/common/primary_button.dart';
import '../../widgets/common/secondary_button.dart';
import '../../widgets/chat/message_ticks.dart';
import '../../models/message_model.dart';
import '../auth/login_screen.dart';
import '../auth/register_screen.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> with SingleTickerProviderStateMixin {
  final ScrollController _scrollController = ScrollController();
  late AnimationController _animController;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.08),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic));

    _animController.forward();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      body: Stack(
        children: [
          // Background Atmospheric Glow
          Positioned(
            top: -100,
            left: -50,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.primaryGreen.withOpacity(0.06),
              ),
            ),
          ),
          Positioned(
            bottom: 200,
            right: -80,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.accentTeal.withOpacity(0.05),
              ),
            ),
          ),

          // Scrollable Content
          SafeArea(
            child: FadeTransition(
              opacity: _fadeAnim,
              child: SlideTransition(
                position: _slideAnim,
                child: CustomScrollView(
                  controller: _scrollController,
                  physics: const BouncingScrollPhysics(),
                  slivers: [
                    // 1. Top Mini Navigation Header
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const ChatFlowLogo(size: 32),
                                const SizedBox(width: 8),
                                const Text(
                                  'ChatFlow',
                                  style: TextStyle(
                                    fontSize: 19,
                                    fontWeight: FontWeight.w800,
                                    color: Colors.white,
                                    letterSpacing: -0.3,
                                  ),
                                ),
                              ],
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                                );
                              },
                              style: TextButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                backgroundColor: AppColors.darkSurface,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                              ),
                              child: const Text(
                                'Login',
                                style: TextStyle(
                                  color: AppColors.primaryGreen,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // 2. HERO SECTION
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                        child: Column(
                          children: [
                            const SizedBox(height: 12),
                            // Pill Badge
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                              decoration: BoxDecoration(
                                color: AppColors.darkGreen.withOpacity(0.3),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: AppColors.primaryGreen.withOpacity(0.5), width: 0.8),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.bolt_rounded, color: AppColors.primaryGreen, size: 16),
                                  SizedBox(width: 6),
                                  Text(
                                    'Real-Time Messaging • Next-Gen Speed',
                                    style: TextStyle(
                                      color: AppColors.primaryGreen,
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Main Headline
                            RichText(
                              textAlign: TextAlign.center,
                              text: const TextSpan(
                                style: TextStyle(
                                  fontSize: 34,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                  letterSpacing: -0.8,
                                  height: 1.15,
                                ),
                                children: [
                                  TextSpan(text: 'Connect. Share.\n'),
                                  TextSpan(
                                    text: 'Flow effortlessly.',
                                    style: TextStyle(
                                      color: AppColors.primaryGreen,
                                      shadows: [
                                        Shadow(
                                          color: AppColors.primaryGreen,
                                          blurRadius: 20,
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'The fastest, most secure, and visually stunning chat platform. No phone numbers required — just your unique username.',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 13.5,
                                color: AppColors.textSecondaryDark,
                                height: 1.45,
                              ),
                            ),
                            const SizedBox(height: 24),

                            // Hero Visual: Orbiting Avatars Cluster
                            _buildHeroAvatarCluster(),
                            const SizedBox(height: 24),

                            // Primary Action Buttons
                            PrimaryButton(
                              text: 'Get Started Free',
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => const RegisterScreen()),
                                );
                              },
                            ),
                            const SizedBox(height: 10),
                            SecondaryButton(
                              text: 'Sign In to Account',
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                                );
                              },
                            ),
                            const SizedBox(height: 14),
                            const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.lock_outline_rounded, color: AppColors.primaryGreen, size: 13),
                                SizedBox(width: 4),
                                Text(
                                  'End-to-End Encrypted • 100% Free Forever',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: AppColors.textSecondaryDark,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),

                    // 3. INTERACTIVE CHAT PREVIEW SECTION
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 20.0),
                        child: _buildChatPreviewCard(),
                      ),
                    ),

                    // 4. CORE FEATURES GRID SECTION
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'EVERYTHING YOU NEED',
                              style: TextStyle(
                                color: AppColors.primaryGreen,
                                fontSize: 11.5,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1.2,
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Built for Speed & Privacy',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 22,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 16),
                            _buildFeatureTile(
                              icon: Icons.alternate_email_rounded,
                              title: 'Username-First Identity',
                              description: 'Find friends and colleagues instantly using @handles without sharing your personal phone number.',
                            ),
                            const SizedBox(height: 10),
                            _buildFeatureTile(
                              icon: Icons.flash_on_rounded,
                              title: 'Instant 0ms Message Speed',
                              description: 'Optimistic UI and real-time Socket.IO sync deliver messages with zero latency.',
                            ),
                            const SizedBox(height: 10),
                            _buildFeatureTile(
                              icon: Icons.videocam_rounded,
                              title: 'HD Audio & Video Calls',
                              description: 'Crystal-clear peer-to-peer WebRTC calling with floating picture-in-picture mode.',
                            ),
                            const SizedBox(height: 10),
                            _buildFeatureTile(
                              icon: Icons.auto_awesome_rounded,
                              title: 'Built-in Meta AI Assistant',
                              description: 'Ask questions, summarize conversations, translate languages, and generate ideas anytime.',
                            ),
                            const SizedBox(height: 10),
                            _buildFeatureTile(
                              icon: Icons.timelapse_rounded,
                              title: '24-Hour Disappearing Stories',
                              description: 'Share photos, video clips, and text updates that automatically expire after 24 hours.',
                            ),
                          ],
                        ),
                      ),
                    ),

                    // 5. HD VIDEO CALLING SHOWCASE
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
                        child: _buildVideoCallCard(),
                      ),
                    ),

                    // 6. BOTTOM CTA & FOOTER
                    SliverToBoxAdapter(
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
                        padding: const EdgeInsets.all(24.0),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF182229), Color(0xFF111B21)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(AppSpacing.radiusLarge),
                          border: Border.all(color: AppColors.primaryGreen.withOpacity(0.3), width: 1),
                        ),
                        child: Column(
                          children: [
                            const ChatFlowLogo(size: 48),
                            const SizedBox(height: 12),
                            const Text(
                              'Ready to experience ChatFlow?',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Join thousands of users enjoying private, fast, and modern messaging.',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 12.5,
                                color: AppColors.textSecondaryDark,
                              ),
                            ),
                            const SizedBox(height: 18),
                            PrimaryButton(
                              text: 'Create Free Account',
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => const RegisterScreen()),
                                );
                              },
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'By continuing, you agree to ChatFlow\'s\nTerms of Service and Privacy Policy',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 10.5,
                                color: AppColors.textSecondaryDark,
                                height: 1.3,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroAvatarCluster() {
    return Stack(
      alignment: Alignment.center,
      children: [
        Container(
          width: 200,
          height: 200,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.primaryGreen.withOpacity(0.08),
          ),
        ),
        Container(
          width: 150,
          height: 150,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.primaryGreen.withOpacity(0.45), width: 3),
            image: const DecorationImage(
              image: NetworkImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'),
              fit: BoxFit.cover,
            ),
          ),
        ),
        Positioned(
          top: 10,
          left: 15,
          child: _buildFloatingBadge('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'),
        ),
        Positioned(
          top: 10,
          right: 15,
          child: _buildFloatingBadge('https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200'),
        ),
      ],
    );
  }

  Widget _buildFloatingBadge(String url) {
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 2),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.4), blurRadius: 8),
        ],
        image: DecorationImage(
          image: NetworkImage(url),
          fit: BoxFit.cover,
        ),
      ),
    );
  }

  Widget _buildChatPreviewCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.darkSurface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
        border: Border.all(color: AppColors.darkBorder, width: 0.8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const CircleAvatar(
                radius: 18,
                backgroundImage: NetworkImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'),
              ),
              const SizedBox(width: 10),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Emma Watson', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                  Text('Online', style: TextStyle(color: AppColors.primaryGreen, fontSize: 11, fontWeight: FontWeight.w600)),
                ],
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.darkGreen.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Text('Live Demo', style: TextStyle(color: AppColors.primaryGreen, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const Divider(color: AppColors.darkBorder, height: 20),

          // Incoming Bubble
          Align(
            alignment: Alignment.centerLeft,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.darkIncomingBubble,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Text('Hey! The new ChatFlow update is super fast ⚡', style: TextStyle(color: Colors.white, fontSize: 13)),
            ),
          ),
          const SizedBox(height: 8),

          // Outgoing Bubble with double blue tick
          Align(
            alignment: Alignment.centerRight,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.darkOutgoingBubble,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Yes! Messages open instantly in 0ms 🔥', style: TextStyle(color: Colors.white, fontSize: 13)),
                  SizedBox(width: 6),
                  MessageTicks(status: MessageStatus.READ, isMine: true, size: 14),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureTile({required IconData icon, required String title, required String description}) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.darkSurface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
        border: Border.all(color: AppColors.darkBorder, width: 0.8),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.darkGreen.withOpacity(0.3),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: AppColors.primaryGreen, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontSize: 14.5, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                Text(description, style: const TextStyle(color: AppColors.textSecondaryDark, fontSize: 12, height: 1.35)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVideoCallCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.darkSurface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
        border: Border.all(color: AppColors.darkBorder, width: 0.8),
      ),
      child: Column(
        children: [
          Row(
            children: [
              const Icon(Icons.videocam_rounded, color: AppColors.primaryGreen, size: 20),
              const SizedBox(width: 8),
              const Text('HD WebRTC Video Calling', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text('1080p HD', style: TextStyle(color: AppColors.primaryGreen, fontSize: 10.5, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Stack(
              alignment: Alignment.bottomCenter,
              children: [
                Image.network(
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600',
                  height: 160,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
                Container(
                  height: 50,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Colors.transparent, Colors.black.withOpacity(0.8)],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.all(10.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.mic_rounded, color: Colors.white, size: 18),
                      SizedBox(width: 16),
                      Icon(Icons.videocam_rounded, color: Colors.white, size: 18),
                      SizedBox(width: 16),
                      Icon(Icons.flip_camera_ios_rounded, color: Colors.white, size: 18),
                      SizedBox(width: 16),
                      Icon(Icons.call_end_rounded, color: AppColors.errorRed, size: 20),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
