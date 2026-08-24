import 'package:flutter/material.dart';

class AppColors {
  // Brand Primary Greens
  static const Color primaryGreen = Color(0xFF25D366);
  static const Color darkGreen = Color(0xFF128C7E);
  static const Color accentTeal = Color(0xFF00A884);
  static const Color lightGreen = Color(0xFF34D399);

  // Dark Theme Backgrounds & Glass Surfaces
  static const Color darkBackground = Color(0xFF0C1317);
  static const Color darkChatBackground = Color(0xFF111B21);
  static const Color darkSurface = Color(0xFF182229);
  static const Color darkSurfaceElevated = Color(0xFF202C33);
  static const Color darkBorder = Color(0xFF2A3942);
  static const Color darkBorderLight = Color(0xFF374248);

  // Message Bubbles
  static const Color darkOutgoingBubble = Color(0xFF005C4B);
  static const Color darkIncomingBubble = Color(0xFF202C33);
  static const Color lightOutgoingBubble = Color(0xFFD9FDD3);
  static const Color lightIncomingBubble = Color(0xFFFFFFFF);

  // Text Colors
  static const Color textPrimaryDark = Color(0xFFE9EDEF);
  static const Color textSecondaryDark = Color(0xFF8696A0);
  static const Color textMutedDark = Color(0xFF667781);
  static const Color textPrimaryLight = Color(0xFF111B21);
  static const Color textSecondaryLight = Color(0xFF667781);

  // Status & Utility Colors
  static const Color onlineGreen = Color(0xFF25D366);
  static const Color blueTick = Color(0xFF53BDEB);
  static const Color errorRed = Color(0xFFEA0038);
  static const Color warningOrange = Color(0xFFFF9800);
  static const Color aiPurple = Color(0xFF9333EA);
  static const Color aiCyan = Color(0xFF00D2FF);

  // Glassmorphic Gradients
  static const LinearGradient greenGlowGradient = LinearGradient(
    colors: [Color(0xFF25D366), Color(0xFF128C7E)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient darkCardGradient = LinearGradient(
    colors: [Color(0xFF182229), Color(0xFF111B21)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient aiAssistantGradient = LinearGradient(
    colors: [Color(0xFF00D2FF), Color(0xFF9333EA)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
