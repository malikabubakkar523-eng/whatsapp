# ChatFlow Flutter Mobile Application

A modern, WhatsApp-inspired messaging application built with **Flutter & Dart**, matching the official **ChatFlow UI/UX Design Specification**.

---

## 🎨 Visual Design System

- **Primary Green**: `#25D366` / `#128C7E` / `#00A884`
- **Dark Background**: `#111B21` / `#0C1317` / `#0B141A`
- **Surfaces & Cards**: `#202C33` / `#182229` / `#2A3942`
- **Message Bubbles**: Outgoing (`#005C4B`), Incoming (`#202C33`)
- **Typography**: SF Pro Display / Google Inter Font
- **Radius**: 12px, 16px, 20px, 24px, 999px (Pill)

---

## 📱 Implemented Screens & Features

1. **Welcome / Landing Screen** (`lib/screens/welcome/welcome_screen.dart`): Brand logo, "Connect. Share. Flow.", user avatar clusters, Get Started & Login buttons.
2. **Login & Register Screens** (`lib/screens/auth/`): Username-first authentication, password visibility toggle, social buttons (Google, Apple, Facebook).
3. **Chat List (Home)** (`lib/screens/home/chat_list_screen.dart`): Search bar, filter chips (`All`, `Unread`, `Groups`, `Archived`), user items with online presence badges, typing preview, unread count badges.
4. **Chat Conversation** (`lib/screens/chat/chat_conversation_screen.dart`): Custom chat bar, incoming/outgoing styled bubbles, audio voice note with waveform player, image message bubble with caption & ticks, bottom input bar with Emoji, Attachment, Camera, and Voice Record / Send.
5. **HD Voice & Video Calling** (`lib/screens/call/video_call_screen.dart`): Full-screen video call layout, duration timer, PIP self preview, floating bottom controls (Mute, Camera, Flip, End Call).
6. **Calls Tab** (`lib/screens/call/calls_tab_screen.dart`): Filter chips (`All`, `Missed`), call log history list with direction indicators and video/voice call triggers.
7. **Status / Stories Tab & Viewer** (`lib/screens/status/`): Circular status ring, "My Status", recent updates list, full-screen story viewer with segment progress bars, reply field, and heart reactions.
8. **Meta AI Assistant** (`lib/screens/ai/meta_ai_screen.dart`): Dedicated assistant conversation with Meta AI badge, quick prompt suggestion chips ("Explain quantum computing", "Tell a joke", "Motivate me", "News today").
9. **Settings & Appearance** (`lib/screens/settings/`): Profile header card, Account, Privacy, Chats, Notifications, Storage & Data, Appearance (Dark, Light, System, Wallpaper), Logout.
10. **New Chat & Search** (`lib/screens/chat/new_chat_screen.dart`, `search_messages_screen.dart`, `pinned_messages_screen.dart`, `archived_chats_screen.dart`).

---

## 🚀 How to Run the Flutter App

### 1. Ensure Backend is Running
In the root directory (`d:/projects/app/five`):
```bash
npm run dev
# Server running on http://localhost:3000
```

### 2. Run the Flutter Mobile App
In the `mobile` directory (`d:/projects/app/five/mobile`):
```bash
flutter pub get
flutter run
```

> **Note for Android Emulator**: The backend API endpoint is pre-configured to `http://10.0.2.2:3000/api` in `lib/core/constants/api_endpoints.dart`. For physical devices, replace `10.0.2.2` with your machine's local Wi-Fi IP address (e.g. `192.168.1.x:3000`).
