import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';
import '../../models/call_model.dart';
import '../../providers/calls_provider.dart';
import '../../widgets/common/user_avatar.dart';
import 'video_call_screen.dart';

class CallsTabScreen extends StatelessWidget {
  const CallsTabScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final callsProvider = Provider.of<CallsProvider>(context);
    final calls = callsProvider.calls;

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        title: const Text('Calls', style: TextStyle(fontWeight: FontWeight.w800)),
        backgroundColor: AppColors.darkBackground,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_call, color: Colors.white, size: 22),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips (All, Missed)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Row(
              children: ['All', 'Missed'].map((filter) {
                final isSelected = callsProvider.activeFilter == filter;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: GestureDetector(
                    onTap: () => callsProvider.setFilter(filter),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.darkGreen.withOpacity(0.35) : AppColors.darkSurface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isSelected ? AppColors.primaryGreen : AppColors.darkBorder,
                          width: isSelected ? 1.2 : 0.8,
                        ),
                      ),
                      child: Text(
                        filter,
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          color: isSelected ? AppColors.primaryGreen : AppColors.textSecondaryDark,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          // Calls List
          Expanded(
            child: ListView.builder(
              itemCount: calls.length,
              itemBuilder: (context, index) {
                final call = calls[index];
                final isMissed = call.status == CallStatus.MISSED;

                return ListTile(
                  leading: UserAvatar(
                    name: call.callerName,
                    imageUrl: call.callerAvatar,
                    radius: 24,
                  ),
                  title: Text(
                    call.callerName,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: isMissed ? AppColors.errorRed : Colors.white,
                    ),
                  ),
                  subtitle: Row(
                    children: [
                      Icon(
                        isMissed
                            ? Icons.call_missed_rounded
                            : (call.status == CallStatus.INCOMING
                                ? Icons.call_received_rounded
                                : Icons.call_made_rounded),
                        size: 16,
                        color: isMissed ? AppColors.errorRed : AppColors.primaryGreen,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${call.createdAt.hour}:${call.createdAt.minute.toString().padLeft(2, '0')} AM',
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                      ),
                    ],
                  ),
                  trailing: IconButton(
                    icon: Icon(
                      call.type == CallType.VIDEO ? Icons.videocam_rounded : Icons.phone_rounded,
                      color: AppColors.primaryGreen,
                      size: 22,
                    ),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => VideoCallScreen(
                            participantName: call.callerName,
                            participantAvatar: call.callerAvatar,
                            isVideo: call.type == CallType.VIDEO,
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
