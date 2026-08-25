import 'dart:ui';
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
      duration: const Duration(milliseconds: 800),
    );
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.05),
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
          // Background Atmospheric Glows
          Positioned(
            top: -80,
            left: -60,
            child: Container(
              width: 340,
              height: 340,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.primaryGreen.withOpacity(0.08),
              ),
            ),
          ),
          Positioned(
            top: 450,
            right: -80,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.aiPurple.withOpacity(0.06),
              ),
            ),
          ),

          // Main Scrollable Body with Visible Animated Scrollbar
          SafeArea(
            child: FadeTransition(
              opacity: _fadeAnim,
              child: SlideTransition(
                position: _slideAnim,
                child: RawScrollbar(
                  controller: _scrollController,
                  thumbVisibility: true,
                  trackVisibility: true,
                  thickness: 6.0,
                  radius: const Radius.circular(8),
                  thumbColor: AppColors.primaryGreen.withOpacity(0.7),
                  trackColor: Colors.white.withOpacity(0.06),
                  trackRadius: const Radius.circular(8),
                  child: CustomScrollView(
                    controller: _scrollController,
                    physics: const BouncingScrollPhysics(),
                    slivers: [
                    // ============================================================
                    // 1. GLASS HEADER
                    // ============================================================
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Row(
                              children: [
                                ChatFlowLogo(size: 32),
                                SizedBox(width: 8),
                                Text(
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
                            Row(
                              children: [
                                TextButton(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                                    );
                                  },
                                  style: TextButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                                  ),
                                  child: const Text(
                                    'Login',
                                    style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                ElevatedButton(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (_) => const RegisterScreen()),
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primaryGreen,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                                    elevation: 0,
                                  ),
                                  child: const Text(
                                    'Get Started',
                                    style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),

                    // ============================================================
                    // 2. HERO SECTION
                    // ============================================================
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                        child: Column(
                          children: [
                            const SizedBox(height: 12),
                            // Speed Badge Pill
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                              decoration: BoxDecoration(
                                color: AppColors.darkGreen.withOpacity(0.25),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: AppColors.primaryGreen.withOpacity(0.4), width: 0.8),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.bolt_rounded, color: AppColors.primaryGreen, size: 16),
                                  SizedBox(width: 6),
                                  Text(
                                    'Real-Time • 0ms Instant Sockets',
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
                                    text: 'Flow.',
                                    style: TextStyle(
                                      color: AppColors.primaryGreen,
                                      shadows: [
                                        Shadow(
                                          color: Color(0x6025D366),
                                          blurRadius: 18,
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'Fast messaging, crystal-clear calls, 24h stories, and built-in AI in one beautiful mobile app. No phone numbers needed.',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 13.5,
                                color: AppColors.textSecondaryDark,
                                height: 1.45,
                              ),
                            ),
                            const SizedBox(height: 24),

                            // Hero Avatars Cluster
                            _buildHeroAvatarCluster(),
                            const SizedBox(height: 24),

                            // Action Buttons
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
                              text: 'Login to Account',
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                                );
                              },
                            ),
                          ],
                        ),
                      ),
                    ),

                    // ============================================================
                    // 3. REALISTIC CHAT PHONE PREVIEW MOCKUP
                    // ============================================================
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
                        child: _buildPhoneChatMockup(),
                      ),
                    ),

                    // ============================================================
                    // 4. CORE FEATURES MATRIX
                    // ============================================================
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
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
                            _buildFeatureCard(
                              icon: Icons.alternate_email_rounded,
                              title: 'Username-First Identity',
                              description: 'Find anyone instantly using @handles. No need to share your personal phone number.',
                            ),
                            const SizedBox(height: 10),
                            _buildFeatureCard(
                              icon: Icons.flash_on_rounded,
                              title: '0ms Message Speed',
                              description: 'Optimistic UI and real-time Socket.IO sync make sending and receiving feel instant.',
                            ),
                            const SizedBox(height: 10),
                            _buildFeatureCard(
                              icon: Icons.videocam_rounded,
                              title: 'HD Audio & Video Calling',
                              description: 'Crystal-clear peer-to-peer WebRTC calling with floating picture-in-picture video.',
                            ),
                            const SizedBox(height: 10),
                            _buildFeatureCard(
                              icon: Icons.auto_awesome_rounded,
                              title: 'Built-in Meta AI Assistant',
                              description: 'Summarize discussions, draft replies, translate messages, and brainstorm anytime.',
                            ),
                            const SizedBox(height: 10),
                            _buildFeatureCard(
                              icon: Icons.timelapse_rounded,
                              title: '24-Hour Disappearing Stories',
                              description: 'Share photos, video clips, and status thoughts that automatically vanish in 24 hours.',
                            ),
                            const SizedBox(height: 10),
                            _buildFeatureCard(
                              icon: Icons.remove_red_eye_rounded,
                              title: 'Real-Time Profile Visitors',
                              description: 'Know instantly when someone views your profile with visitor logs and timestamps.',
                            ),
                          ],
                        ),
                      ),
                    ),

                    // ============================================================
                    // 5. HD VIDEO CALL SHOWCASE
                    // ============================================================
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
                        child: _buildVideoCallShowcase(),
                      ),
                    ),

                    // ============================================================
                    // 6. PROFILE VISITORS SHOWCASE
                    // ============================================================
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
                        child: _buildVisitorsShowcase(),
                      ),
                    ),

                    // ============================================================
                    // 7. 24H STORIES SHOWCASE
                    // ============================================================
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
                        child: _buildStoriesShowcase(),
                      ),
                    ),

                    // ============================================================
                    // 8. META AI ASSISTANT SHOWCASE
                    // ============================================================
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
                        child: _buildAIShowcase(),
                      ),
                    ),

                    // ============================================================
                    // 9. PRIVACY & SECURITY SUITE
                    // ============================================================
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
                        child: _buildPrivacyShowcase(),
                      ),
                    ),

                    // ============================================================
                    // 9. HOW CHATFLOW WORKS (1-2-3)
                    // ============================================================
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
                        child: _buildHowItWorks(),
                      ),
                    ),

                    // ============================================================
                    // 10. FINAL CTA CARD
                    // ============================================================
                    SliverToBoxAdapter(
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 20.0),
                        padding: const EdgeInsets.all(24.0),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF182229), Color(0xFF111B21)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(AppSpacing.radiusLarge),
                          border: Border.all(color: AppColors.primaryGreen.withOpacity(0.35), width: 1.2),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primaryGreen.withOpacity(0.08),
                              blurRadius: 24,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            const ChatFlowLogo(size: 48),
                            const SizedBox(height: 14),
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
                              'Join thousands of users enjoying private, instant, and modern messaging.',
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
                            const SizedBox(height: 12),
                            const Text(
                              '100% Free Forever • No Credit Card Required',
                              style: TextStyle(fontSize: 11, color: AppColors.primaryGreen, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // ============================================================
                    // 11. FOOTER
                    // ============================================================
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 20.0),
                        child: Column(
                          children: [
                            const Text(
                              '© 2026 ChatFlow Inc. All rights reserved.',
                              style: TextStyle(color: AppColors.textMutedDark, fontSize: 11),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                TextButton(
                                  onPressed: () {},
                                  child: const Text('Terms of Service', style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 11)),
                                ),
                                const Text('•', style: TextStyle(color: AppColors.textMutedDark)),
                                TextButton(
                                  onPressed: () {},
                                  child: const Text('Privacy Policy', style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 11)),
                                ),
                              ],
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
        ),
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

  Widget _buildPhoneChatMockup() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.darkSurface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLarge),
        border: Border.all(color: AppColors.darkBorder, width: 0.8),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 16),
        ],
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
                child: const Text('Live Mockup', style: TextStyle(color: AppColors.primaryGreen, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const Divider(color: AppColors.darkBorder, height: 20),

          // Incoming Text
          Align(
            alignment: Alignment.centerLeft,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.darkIncomingBubble,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Text('Hey! The new ChatFlow UI is super smooth ⚡', style: TextStyle(color: Colors.white, fontSize: 13)),
            ),
          ),
          const SizedBox(height: 8),

          // Outgoing Text with Double Blue Ticks
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
          const SizedBox(height: 8),

          // Voice Memo Waveform
          Align(
            alignment: Alignment.centerLeft,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.darkIncomingBubble,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.play_arrow_rounded, color: AppColors.primaryGreen, size: 22),
                  SizedBox(width: 8),
                  Text('||||||||||||||||||', style: TextStyle(color: AppColors.primaryGreen, fontSize: 12, letterSpacing: 2)),
                  SizedBox(width: 8),
                  Text('0:14', style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 11)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureCard({required IconData icon, required String title, required String description}) {
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

  Widget _buildVideoCallShowcase() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.darkSurface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
        border: Border.all(color: AppColors.darkBorder, width: 0.8),
      ),
      child: Column(
        children: [
          const Row(
            children: [
              Icon(Icons.videocam_rounded, color: AppColors.primaryGreen, size: 20),
              SizedBox(width: 8),
              Text('HD WebRTC Video Calling', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
              Spacer(),
              Text('1080p HD', style: TextStyle(color: AppColors.primaryGreen, fontSize: 11, fontWeight: FontWeight.bold)),
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
                  height: 150,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
                Container(
                  height: 44,
                  color: Colors.black54,
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.mic_rounded, color: Colors.white, size: 18),
                      SizedBox(width: 16),
                      Icon(Icons.videocam_rounded, color: Colors.white, size: 18),
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

  Widget _buildVisitorsShowcase() {
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
              const Icon(Icons.remove_red_eye_rounded, color: AppColors.primaryGreen, size: 20),
              const SizedBox(width: 8),
              const Text('Profile Visitors', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.primaryGreen.withOpacity(0.4), width: 0.8),
                ),
                child: const Text('New Feature', style: TextStyle(color: AppColors.primaryGreen, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.darkBackground,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.darkBorder.withOpacity(0.5), width: 0.8),
            ),
            child: Row(
              children: [
                const CircleAvatar(
                  radius: 18,
                  backgroundImage: NetworkImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'),
                ),
                const SizedBox(width: 10),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Emma Watson', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13.5)),
                      Text('Visited your profile • 2m ago', style: TextStyle(color: AppColors.primaryGreen, fontSize: 11, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.darkSurfaceElevated,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primaryGreen.withOpacity(0.3), width: 0.8),
                  ),
                  child: const Text('Chat', style: TextStyle(color: AppColors.primaryGreen, fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStoriesShowcase() {
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
          const Row(
            children: [
              Icon(Icons.donut_large_rounded, color: AppColors.primaryGreen, size: 20),
              SizedBox(width: 8),
              Text('24h Disappearing Stories', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildStoryThumb('My Status', '', isAdd: true),
              const SizedBox(width: 12),
              _buildStoryThumb('Emma', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'),
              const SizedBox(width: 12),
              _buildStoryThumb('Michael', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStoryThumb(String name, String url, {bool isAdd = false}) {
    return Column(
      children: [
        Container(
          width: 52,
          height: 52,
          padding: const EdgeInsets.all(2.5),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.primaryGreen, width: 2),
          ),
          child: CircleAvatar(
            backgroundImage: url.isNotEmpty ? NetworkImage(url) : null,
            backgroundColor: AppColors.darkSurfaceElevated,
            child: isAdd ? const Icon(Icons.add_rounded, color: AppColors.primaryGreen) : null,
          ),
        ),
        const SizedBox(height: 4),
        Text(name, style: const TextStyle(color: AppColors.textSecondaryDark, fontSize: 11)),
      ],
    );
  }

  Widget _buildAIShowcase() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.darkSurface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
        border: Border.all(color: AppColors.darkBorder, width: 0.8),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.auto_awesome_rounded, color: Color(0xFF00D2FF), size: 20),
              SizedBox(width: 8),
              Text('ChatFlow AI Companion', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
              Spacer(),
              Icon(Icons.verified_rounded, color: Color(0xFF00D2FF), size: 16),
            ],
          ),
          SizedBox(height: 10),
          Text(
            '"Explain quantum computing in simple terms ✨"',
            style: TextStyle(color: AppColors.primaryGreen, fontSize: 13, fontStyle: FontStyle.italic),
          ),
          SizedBox(height: 4),
          Text(
            'Quantum computers use superposition qubits to solve complex calculations at lightning speed!',
            style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _buildPrivacyShowcase() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.darkSurface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMedium),
        border: Border.all(color: AppColors.darkBorder, width: 0.8),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.security_rounded, color: AppColors.primaryGreen, size: 20),
              SizedBox(width: 8),
              Text('Privacy & Security First', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
            ],
          ),
          SizedBox(height: 8),
          Text(
            'End-to-End Encryption, view-once disappearing media, custom last-seen privacy, and username-first contacts ensure your data stays strictly yours.',
            style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 12.5, height: 1.35),
          ),
        ],
      ),
    );
  }

  Widget _buildHowItWorks() {
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
          const Text('HOW IT WORKS', style: TextStyle(color: AppColors.primaryGreen, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
          const SizedBox(height: 4),
          const Text('Get Started in Seconds', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _buildStepRow('1', 'Pick a Username', 'Create a unique @handle without entering your phone number.'),
          const SizedBox(height: 8),
          _buildStepRow('2', 'Connect Instantly', 'Search colleagues or invite friends via username or QR code.'),
          const SizedBox(height: 8),
          _buildStepRow('3', 'Chat & Flow', 'Enjoy instant messaging, HD video calling, and 24h stories.'),
        ],
      ),
    );
  }

  Widget _buildStepRow(String number, String title, String desc) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CircleAvatar(
          radius: 12,
          backgroundColor: AppColors.primaryGreen,
          child: Text(number, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.bold)),
              Text(desc, style: const TextStyle(color: AppColors.textSecondaryDark, fontSize: 12)),
            ],
          ),
        ),
      ],
    );
  }
}
